from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from database import get_session
from models import Job, JobCreate, JobUpdate, JobStatus
from scheduler import broadcast_notification

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=List[Job])
def list_jobs(
    status: Optional[JobStatus] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(Job).order_by(Job.last_date.asc())
    if status:
        query = query.where(Job.status == status)
    
    jobs = session.exec(query).all()

    today = date.today()
    # Dynamic expiration check for any query
    updated = False
    for job in jobs:
        if job.status == JobStatus.active and job.last_date < today:
            job.status = JobStatus.expired
            session.add(job)
            updated = True
    if updated:
        session.commit()
        # Re-fetch if status was filtered
        if status:
            query = select(Job).where(Job.status == status).order_by(Job.last_date.asc())
            jobs = session.exec(query).all()

    if search:
        s = search.lower()
        jobs = [
            j for j in jobs
            if s in j.title.lower() or s in j.department.lower() or s in j.category.lower()
        ]

    return jobs

@router.post("/", response_model=Job)
def create_job(job_in: JobCreate, notify: bool = Query(default=True), session: Session = Depends(get_session)):
    job = Job.model_validate(job_in)
    session.add(job)
    session.commit()
    session.refresh(job)

    if notify:
        # Broadcast "New Job Alert"
        broadcast_notification(
            title=f"New Job: {job.title}",
            message=f"{job.department} posted a new vacancy in {job.category}. Last date: {job.last_date}",
            url=job.apply_link,
            job_id=job.id,
            log_type="posted"
        )

    return job

@router.get("/{job_id}", response_model=Job)
def get_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}/apply", response_model=Job)
def mark_applied(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Toggle or mark as applied
    if job.status == JobStatus.applied:
        # Revert to active if not expired
        job.status = JobStatus.expired if job.last_date < date.today() else JobStatus.active
    else:
        job.status = JobStatus.applied

    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.patch("/{job_id}", response_model=Job)
def update_job(job_id: int, job_update: JobUpdate, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)

    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    session.delete(job)
    session.commit()
    return {"message": "Job deleted successfully", "id": job_id}
