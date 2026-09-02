from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select

from database import get_session
from models import PushSubscription, NotificationLog
from utils.vapid_helper import get_or_create_vapid_keys
from scheduler import broadcast_notification, check_and_notify_jobs

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Returns the base64 VAPID public key for web push registration."""
    vapid_info = get_or_create_vapid_keys()
    return {"publicKey": vapid_info["public_key"]}

@router.post("/subscribe")
def subscribe(payload: Dict[str, Any] = Body(...), session: Session = Depends(get_session)):
    """Receives standard browser PushSubscription JSON and registers it."""
    endpoint = payload.get("endpoint")
    keys = payload.get("keys", {})
    p256dh = keys.get("p256dh") or payload.get("p256dh")
    auth = keys.get("auth") or payload.get("auth")

    if not endpoint or not p256dh or not auth:
        raise HTTPException(status_code=400, detail="Invalid push subscription payload (missing endpoint or keys)")

    # Check if existing
    existing = session.exec(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    ).first()

    if existing:
        existing.p256dh = p256dh
        existing.auth = auth
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return {"message": "Subscription updated successfully", "id": existing.id}
    
    sub = PushSubscription(endpoint=endpoint, p256dh=p256dh, auth=auth)
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return {"message": "Subscription registered successfully", "id": sub.id}

@router.post("/test")
def send_test_notification():
    """Triggers an immediate test push notification to verify setup."""
    sent = broadcast_notification(
        title="🔔 Notification Test Success!",
        message="Sarkari Job Notifier push notifications are working smoothly on your device.",
        url="/",
        log_type="test"
    )
    return {
        "message": f"Test push sent to {sent} active subscribers",
        "delivered": sent
    }

@router.post("/trigger-check")
def trigger_deadline_check():
    """Manually triggers the daily reminder & auto-expire check (for testing or external cron)."""
    check_and_notify_jobs()
    return {"message": "Job deadline check completed successfully."}

@router.get("/logs", response_model=List[NotificationLog])
def list_logs(limit: int = 50, session: Session = Depends(get_session)):
    """Returns recent notification activity logs."""
    logs = session.exec(
        select(NotificationLog).order_by(NotificationLog.sent_at.desc()).limit(limit)
    ).all()
    return logs
