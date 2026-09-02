import json
import logging
from datetime import date, datetime
from typing import Optional
from sqlmodel import Session, select
from apscheduler.schedulers.background import BackgroundScheduler
from pywebpush import webpush, WebPushException

from database import engine
from models import Job, JobStatus, PushSubscription, NotificationLog
from utils.vapid_helper import get_or_create_vapid_keys

logger = logging.getLogger("scheduler")
logging.basicConfig(level=logging.INFO)

scheduler = BackgroundScheduler()

def send_push_to_subscription(sub: PushSubscription, payload: dict, vapid_info: dict) -> bool:
    """Send web push to a single subscriber. Returns True if successful, False if expired/failed."""
    try:
        webpush(
            subscription_info={
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            },
            data=json.dumps(payload),
            vapid_private_key=vapid_info["private_key"],
            vapid_claims={"sub": vapid_info["email"]}
        )
        return True
    except WebPushException as ex:
        logger.warning(f"Push failed for endpoint {sub.endpoint[:30]}...: {ex}")
        # Response status 404 or 410 means subscription is gone/unsubscribed
        if ex.response is not None and ex.response.status_code in (404, 410):
            with Session(engine) as session:
                stale_sub = session.exec(
                    select(PushSubscription).where(PushSubscription.id == sub.id)
                ).first()
                if stale_sub:
                    session.delete(stale_sub)
                    session.commit()
                    logger.info(f"Removed expired subscription ID {sub.id}")
        return False
    except Exception as e:
        logger.error(f"Unexpected push error: {e}")
        return False

def broadcast_notification(title: str, message: str, url: Optional[str] = None, job_id: Optional[int] = None, log_type: str = "custom") -> int:
    """Broadcasts a push notification to all stored push subscribers."""
    vapid_info = get_or_create_vapid_keys()
    payload = {
        "title": title,
        "body": message,
        "icon": "/icon-192.png",
        "badge": "/icon-192.png",
        "data": {
            "url": url or "/",
            "job_id": job_id
        }
    }

    with Session(engine) as session:
        subs = session.exec(select(PushSubscription)).all()
        if not subs:
            logger.info("No push subscribers registered yet.")
            return 0

        success_count = 0
        for sub in subs:
            if send_push_to_subscription(sub, payload, vapid_info):
                success_count += 1

        # Record notification log
        log_entry = NotificationLog(
            job_id=job_id,
            type=log_type,
            title=title,
            message=message,
            sent_at=datetime.utcnow()
        )
        session.add(log_entry)
        session.commit()

        logger.info(f"Broadcast sent: '{title}' to {success_count}/{len(subs)} subscribers.")
        return success_count

def check_and_notify_jobs():
    """Checks active job deadlines, automatically expires past jobs, and triggers reminder alerts."""
    logger.info("Running job deadline check...")
    today = date.today()

    with Session(engine) as session:
        active_jobs = session.exec(
            select(Job).where(Job.status == JobStatus.active)
        ).all()

        for job in active_jobs:
            days_left = (job.last_date - today).days

            # Auto-expire
            if days_left < 0:
                logger.info(f"Job #{job.id} '{job.title}' expired (last date was {job.last_date})")
                job.status = JobStatus.expired
                session.add(job)
                session.commit()
                continue

            # Check reminder windows: 7 days, 3 days, 1 day, 0 days (last date)
            if days_left in (7, 3, 1, 0):
                tag = f"{days_left}day" if days_left > 0 else "final"

                # Check if notification was already sent for this job & tag
                existing_log = session.exec(
                    select(NotificationLog).where(
                        NotificationLog.job_id == job.id,
                        NotificationLog.type == tag
                    )
                ).first()

                if not existing_log:
                    if days_left == 0:
                        title = f"Last Day: {job.title}"
                        msg = f"Final call! Today is the last date to apply for {job.title} ({job.department}). Don't miss it!"
                    elif days_left == 1:
                        title = f"1 Day Left: {job.title}"
                        msg = f"Deadline tomorrow! Apply soon for {job.title} ({job.department})."
                    else:
                        title = f"{days_left} Days Left: {job.title}"
                        msg = f"{days_left} days remaining to submit application for {job.title} ({job.department})."

                    logger.info(f"Sending {tag} reminder for Job #{job.id}")
                    broadcast_notification(
                        title=title,
                        message=msg,
                        url=job.apply_link,
                        job_id=job.id,
                        log_type=tag
                    )

def start_scheduler():
    """Starts the background scheduler running daily at 8:00 AM."""
    if not scheduler.running:
        scheduler.add_job(
            check_and_notify_jobs,
            trigger="cron",
            hour=8,
            minute=0,
            id="daily_job_check",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler started (daily check at 8:00 AM).")
