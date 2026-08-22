# Dayflow HRMS Backend

This is the FastAPI backend for the Dayflow HRMS application.

## Setup Instructions

1. **Python Environment**
   Ensure you have Python 3.12+ installed.
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup**
   Ensure PostgreSQL is running. Create a database named `dayflow`.
   Rename `.env.example` to `.env` and update the `DATABASE_URL` with your postgres credentials.
   
   Run migrations:
   ```bash
   alembic upgrade head
   ```

4. **Run Server**
   ```bash
   uvicorn app.main:app --reload
   ```
