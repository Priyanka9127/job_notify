from enum import Enum
from typing import Optional
from datetime import date, datetime
from sqlmodel import SQLModel, Field

class JobStatus(str, Enum):
    active = "active"
    applied = "applied"
    expired = "expired"

class JobBase(SQLModel):
    title: str
    department: str
    category: str = "General"
    post_date: date = Field(default_factory=date.today)
    last_date: date
    apply_link: str
    status: JobStatus = JobStatus.active
    notes: Optional[str] = None

class Job(JobBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobCreate(JobBase):
    pass

class JobUpdate(SQLModel):
    title: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    post_date: Optional[date] = None
    last_date: Optional[date] = None
    apply_link: Optional[str] = None
    status: Optional[JobStatus] = None
    notes: Optional[str] = None

class PushSubscription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    endpoint: str = Field(index=True, unique=True)
    p256dh: str
    auth: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PushSubscriptionCreate(SQLModel):
    endpoint: str
    keys: dict

class NotificationLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: Optional[int] = Field(default=None, foreign_key="job.id")
    type: str
    title: str
    message: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)
