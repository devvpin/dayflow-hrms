<div align="center">
  <img src="https://ui-avatars.com/api/?name=Day+Flow&background=2563eb&color=fff&size=128&rounded=true" alt="Dayflow Logo" width="100"/>
  
  # 🌟 Dayflow HRMS
  
  **The Modern, Effortless Human Resource Management System**
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

A beautiful, high-performance Human Resource Management System built to simplify the employee lifecycle, automate attendance tracking, and streamline payroll processing. Designed from the ground up for modern enterprises requiring speed, reliability, and an exceptional user experience.

## ✨ Key Features

- **🛡️ RBAC (Role-Based Access Control):** Secure, isolated dashboards and permission architectures for Employees, HR staff, and Administrators.
- **📅 Smart Attendance Tracking:** Streamlined clocking, automated status calculations (`PRESENT`, `ABSENT`, `LATE`), and rich telemetry.
- **🏖️ Automated Leave Management:** Frictionless leave applications (`PAID`, `SICK`, `UNPAID`), complete with administrative approval workflows and allowance tracking.
- **💰 Dynamic Payroll Engine:** Fast compensation processing with historical salary snapshots, effective dates, and deduplication logic.
- **📊 Real-Time Analytics:** Stunning data visualization and direct CSV report generation for company-wide HR metrics.
- **🔔 Notification Hub:** Stay connected with zero-latency inter-departmental alerts and updates.

<br />

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Python 3.10+, FastAPI (Asynchronous), SQLAlchemy, Pydantic |
| **Database** | PostgreSQL, asyncpg driver |
| **Security** | OAuth2 with JWT Bearer Tokens, Bcrypt Password Hashing |

<br />

## 🚀 Quick Start

### 1. Database Setup
Ensure PostgreSQL is running locally (or in Docker) and provision your database:
```bash
createdb hrms_db
```

### 2. Backend Initialization
Navigate to the backend directory, construct your virtual environment, and apply configurations.

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Duplicate `backend/.env.example` into `backend/.env` and establish your database URL:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/hrms_db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Bootstrap your database and launch the incredibly fast ASGI server:
```bash
# Seed the dummy data to populate the charts and tables
python seed_dummy.py

# Start the uvicorn engine
uvicorn app.main:app --reload
```

### 3. Frontend Initialization
Boot up the lightning-fast Vite development server:
```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Credentials
If you executed the `seed_dummy.py` script, access the full suite of Admin features with:
- **Email:** `admin@dayflow.com`
- **Password:** `admin123`

<br />

## 🔒 Security Best Practices
- CORS origins are explicitly whitelisted within the FastAPI setup.
- Complex cascading database deletions safely severe cyclic foreign properties without compromising data integrity.
- JSON Web Tokens seamlessly orchestrate multi-tier permissions, strictly gating Admin endpoints from generic HTTP clients.

---
<div align="center">
  <i>Built with speed, stability, and scale in mind.</i>
</div>