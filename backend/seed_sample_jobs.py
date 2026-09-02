from datetime import date, timedelta
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Job, JobStatus

def seed():
    create_db_and_tables()
    today = date.today()

    sample_jobs = [
        # --- CS & IT Sector (B.Tech CSE / IT / AI) ---
        Job(
            title="NIC Scientist 'B' & Scientific Officer (CS/IT/AI)",
            department="National Informatics Centre (NIC / MeitY)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=3),
            last_date=today + timedelta(days=12),
            apply_link="https://www.calicut.nielit.in/nic24",
            status=JobStatus.active,
            notes="B.Tech CSE/IT/AI eligible. Level 10 Pay Matrix (Rs. 56,100 - 1,77,500). System software, AI, Cloud & Cyber Security roles."
        ),
        Job(
            title="ISRO Scientist/Engineer 'SC' (Computer Science)",
            department="Indian Space Research Organisation (ISRO)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=7),
            last_date=today + timedelta(days=5),
            apply_link="https://www.isro.gov.in/Careers.html",
            status=JobStatus.active,
            notes="B.E/B.Tech in Computer Science / AI with min 65% / CGPA 6.84. Core systems, satellite telemetry, data processing."
        ),
        Job(
            title="DRDO Scientist 'B' Recruitment (Computer Science)",
            department="DRDO - Recruitment & Assessment Centre (RAC)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=10),
            last_date=today + timedelta(days=2),
            apply_link="https://rac.gov.in",
            status=JobStatus.active,
            notes="B.Tech in CSE / IT. Level 10 Gazetted post. Urgent: Deadline in 2 days!"
        ),
        Job(
            title="IBPS IT Officer (Scale-I) Specialist Cadre",
            department="Institute of Banking Personnel Selection (IBPS)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=4),
            last_date=today + timedelta(days=9),
            apply_link="https://www.ibps.in",
            status=JobStatus.active,
            notes="4-Year B.Tech in Computer Science / IT / AI. Scale-I Bank Officer in Nationalized Banks (Core Banking Systems & Security)."
        ),
        Job(
            title="CDAC Project Engineer (AI, Python, Cloud & LLM Systems)",
            department="Centre for Development of Advanced Computing (C-DAC)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=2),
            last_date=today + timedelta(days=15),
            apply_link="https://www.cdac.in/index.aspx?id=careers",
            status=JobStatus.active,
            notes="B.Tech CSE/IT/AI. Direct match with Python, FastAPI, NLP & AI Engineering. National Supercomputing & AI mission."
        ),
        Job(
            title="BARC Scientific Officer (OCES/DGFS - Computer Science)",
            department="Bhabha Atomic Research Centre (BARC)",
            category="Computer Science & IT",
            post_date=today - timedelta(days=1),
            last_date=today + timedelta(days=21),
            apply_link="https://barcocesexam.in",
            status=JobStatus.active,
            notes="Group 'A' Gazetted Officer post. B.Tech CS/AI/Data Science eligible. High Performance Computing, Nuclear Reactor Simulation."
        ),

        # --- General Sarkari Jobs ---
        Job(
            title="SSC CGL 2026 Examination (Combined Graduate Level)",
            department="Staff Selection Commission (SSC)",
            category="Graduate / Central Govt",
            post_date=today - timedelta(days=10),
            last_date=today + timedelta(days=3),
            apply_link="https://ssc.gov.in",
            status=JobStatus.active,
            notes="17,727+ Group B & C Vacancies. Age: 18-30. Fee: Rs 100."
        ),
        Job(
            title="UPSC Civil Services Examination (CSE) 2026",
            department="Union Public Service Commission (UPSC)",
            category="All India Services (IAS/IPS/IFS)",
            post_date=today - timedelta(days=5),
            last_date=today + timedelta(days=1),
            apply_link="https://upsconline.nic.in",
            status=JobStatus.active,
            notes="Preliminary examination. Any graduate degree eligible. Fee: Rs 100 (Exempted for Women/SC/ST)."
        )
    ]

    with Session(engine) as session:
        for j in sample_jobs:
            existing = session.exec(select(Job).where(Job.title == j.title)).first()
            if not existing:
                session.add(j)
        session.commit()
        print("[Seed] Seed synchronization completed!")

if __name__ == "__main__":
    seed()
