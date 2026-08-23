<div align="center">
  <img src="https://ui-avatars.com/api/?name=Day+Flow&background=2563eb&color=fff&size=128&rounded=true" alt="Dayflow Logo" width="100"/>
  
  # 🌟 Dayflow HRMS

  **Every workday, perfectly aligned.**

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

<br />

A modern, full-stack **Human Resource Management System** built to digitize and streamline core HR operations — employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows — all behind a secure, role-based architecture.

---

## ✨ Features at a Glance

### 🔐 Authentication & Authorization
- **Secure Sign Up / Sign In** with email and password (bcrypt-hashed)
- **JWT Bearer Token** authentication with configurable expiry
- **Role-Based Access Control (RBAC)** — three distinct roles: `ADMIN`, `HR`, and `EMPLOYEE`
- Incorrect credentials display clear error messages; successful login redirects to role-appropriate dashboard

### 👥 Employee Management (Admin)
- **Add New Employees** directly from the admin panel — creates user account, employee profile, and baseline payroll record in one step
- **Edit Employee Details** — name, department, designation, role, phone, address, active status
- **View / Search / Filter** the full employee directory by name, email, ID, or department
- Inline status badges (Active / Inactive) with instant visual feedback

### 📋 Employee Profile (Self-Service)
- Employees can view their own personal details, job info, salary structure, and profile picture
- Limited self-edit on personal fields (phone, address, profile picture)

### 📅 Attendance Tracking
- **Employee Check-In / Check-Out** with daily timestamp recording
- Status types: `PRESENT`, `ABSENT`, `HALF-DAY`, `LATE`, `LEAVE`
- **Employee View** — personal attendance history (daily / weekly)
- **Admin View** — company-wide attendance records with approve / edit capabilities

### 🏖️ Leave & Time-Off Management
- **Apply for Leave** — select type (`PAID`, `SICK`, `UNPAID`), date range, and remarks
- **Leave Status Tracking** — `Pending`, `Approved`, `Rejected` with real-time updates
- **Admin Approval Workflow** — view all pending requests, approve or reject with comments
- Leave balance tracking per employee

### 💰 Payroll & Salary Management
- **Employee Payroll View** — read-only salary breakdown (basic, allowances, deductions, net)
- **Admin Payroll Control** — view all employee payrolls, update salary structures, manage effective dates
- Auto-seeding of baseline payroll when new employees are created

### 📊 Reports & Analytics
- **Admin Reports Dashboard** — company-wide HR metrics at a glance
- CSV export capabilities for attendance and payroll data
- Salary slip generation and attendance summaries

### 🔔 Notifications
- In-app notification hub for inter-departmental alerts and updates
- Real-time status changes reflected across dashboards

### ⚙️ Admin Settings
- System-level configuration panel for HR officers and administrators

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Lucide Icons, Axios |
| **Backend** | Python 3.10+, FastAPI (fully async), SQLAlchemy 2.0 (async ORM), Pydantic v2 |
| **Database** | PostgreSQL with `asyncpg` driver |
| **Migrations** | Alembic |
| **Security** | OAuth2 + JWT Bearer Tokens (`python-jose`), Bcrypt password hashing (`passlib`) |
| **Dev Tools** | Uvicorn (ASGI), OxLint, PostCSS, Autoprefixer |

---

## 🚀 How to Run the Project

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- **PostgreSQL** running locally (or via Docker)

---

### Step 1 — Create the Database

Open your PostgreSQL shell (or pgAdmin) and create a new database:

```sql
CREATE DATABASE dayflow;
```

---

### Step 2 — Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy the example env file and edit it with your database credentials:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/dayflow
SECRET_KEY=your-super-secret-key-here-for-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

#### Run Database Migrations

```bash
alembic upgrade head
```

#### Seed the Admin Account

```bash
python seed.py
```

This creates the default admin user with linked employee profile and payroll record.

#### Start the Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be live at **http://localhost:8000**  
Swagger docs available at **http://localhost:8000/docs**

---

### Step 3 — Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be live at **http://localhost:5173**

---

### Step 4 — Login & Explore

Use the seeded admin credentials:

| Field | Value |
|---|---|
| **Email** | `admin@dayflow.com` |
| **Password** | `admin` |

Once logged in as Admin, you can:
1. **Add new employees** from the Employee Management page
2. **Track attendance** and approve records
3. **Manage leave requests** — approve or reject with comments
4. **Update payroll** structures for any employee
5. **View reports** and export data

Employees can register via the Sign Up page and will get the `EMPLOYEE` role by default.

---

## 📁 Project Structure

```
dayflow-hrms/
├── backend/
│   ├── app/
│   │   ├── core/          # Database config, settings
│   │   ├── models/        # SQLAlchemy models (User, Employee, Attendance, Leave, Payroll, etc.)
│   │   ├── routers/       # FastAPI route handlers
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic layer
│   │   └── utils/         # Security helpers (JWT, hashing)
│   ├── alembic/           # Database migrations
│   ├── seed.py            # Admin seeder script
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components (Sidebar, ProtectedRoute, etc.)
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── layouts/       # Dashboard layout with sidebar navigation
│   │   ├── pages/
│   │   │   ├── admin/     # Admin pages (Employees, Attendance, Leaves, Payroll, Reports, Settings)
│   │   │   ├── employee/  # Employee pages (Dashboard, Profile, Attendance, Leaves, Payroll)
│   │   │   ├── auth/      # Login & Register
│   │   │   └── common/    # Notifications
│   │   └── services/      # Axios API service layer
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔒 Security Highlights

- **CORS** origins explicitly whitelisted in FastAPI middleware
- **JWT tokens** enforce multi-tier permissions — admin endpoints are strictly gated
- **Bcrypt** password hashing with salt rounds for secure credential storage
- **Async database connections** via `asyncpg` prevent blocking under load
- Protected frontend routes with role-based guards (`ProtectedRoute` component)

---

## 🔮 Future Enhancements

- 📧 Email notification alerts for leave approvals and attendance reminders
- 📱 Mobile-responsive PWA support
- 📈 Advanced analytics dashboard with charts and trend analysis
- 🧾 Downloadable salary slips (PDF generation)
- 🔄 Shift management and overtime tracking

---

<div align="center">
  <b>Dayflow HRMS</b> — Built with speed, stability, and scale in mind.
  <br /><br />
  <i>Every workday, perfectly aligned.</i>
</div>