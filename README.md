## Society Maintenance Tracker:

A full-stack web application built to simplify maintenance management in apartment societies. Residents can raise complaints with photos, track their complaint status, and stay updated through notices, while admins can manage complaints, assign priorities, and monitor overall maintenance activity from a dashboard.

Live Demo:
society-maintenance-tracker-delta-three.vercel.app 

Backend API:
society-maintenance-tracker-backend.onrender.com 

## Tech Stack
Frontend: React, Tailwind CSS, Vite, Recharts
Backend: FastAPI, Python, SQLAlchemy
Database: PostgreSQL
Authentication: JWT with role-based access
Photo Storage: Cloudinary
Email: Brevo Transactional Email API
Deployment: Vercel for frontend, Render for backend and PostgreSQL

## Features
# Resident Features:
Register and log in securely.
Raise maintenance complaints by selecting a category and adding a description.
Upload a photo along with a complaint when needed.
Track all personal complaints and their current status.
View the complete status history of a complaint.
Receive email notifications when a complaint status changes.

# Admin Features:
View all complaints from a centralized dashboard.
Filter complaints based on category.
Set complaint priority as Low, Medium, or High.
Update complaint status from Open → In Progress → Resolved.
Add notes while updating complaint status.
Identify overdue complaints that require attention.
Create and manage society notices.
Pin important notices to the top.
Send email notifications to residents for important announcements.

## Dashboard:
The admin dashboard provides a quick overview of the society's maintenance activity, including:
Total number of complaints
Complaints by status
Complaints by category
Number of overdue complaint.

## Backend Setup:
cd backend

python -m venv venv

 Windows
.\venv\Scripts\Activate.ps1
macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# The backend will run at:
http://localhost:8000
Interactive API documentation is available at:

http://localhost:8000/docs

## Frontend Setup:
cd frontend

npm install
cp .env.example .env
npm run dev
The frontend will run at:

http://localhost:5173

## Environment Variables:
# Backend

Create a .env file inside the backend folder:

DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=xxxxx
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OVERDUE_THRESHOLD_DAYS=5
CLOUDINARY_CLOUD_NAME=xxxxxx
CLOUDINARY_API_KEY=yxxxxxx
CLOUDINARY_API_SECRET=xxxxxx
BREVO_API_KEY=xxxxx
MAIL_FROM=xxxxxxxxx

FRONTEND_URL=http://localhost:5173

You can generate a secure JWT secret key using:

python -c "import secrets; print(secrets.token_hex(32))"
Frontend

Create a .env file inside the frontend folder:

VITE_API_URL=http://localhost:8000

## Database Design:

The application uses PostgreSQL with SQLAlchemy to manage the data.

# Users
Stores resident and admin accounts.

# Each user has:
ID
Name
Email
Password hash
Role (resident or admin)

# Complaints
Stores maintenance complaints raised by residents.

# Each complaint contains:
Resident ID
Category
Description
Optional photo URL
Current status
Priority
Creation timestamp

Supported complaint categories include:

Plumbing
Electrical
Security
Housekeeping
Parking
Other

# Complaint History
Every time an admin changes a complaint's status, a new history record is created.

# It stores:
Complaint ID
Status
Optional admin note
Timestamp

This allows residents and admins to see how a complaint progressed over time.

# Notices
Stores announcements posted by administrators.

# Notices include:
Title
Content
Important/not-important status
Admin who posted it
Creation timestamp

Important notices are automatically displayed at the top and trigger email notifications to residents.

# API Overview:

Interactive Swagger documentation is available at:
Backend Swagger API Docs
Authentication
POST /auth/register
Creates a new resident or admin account.
POST /auth/login
Authenticates the user and returns a JWT access token.

# Complaints

POST /complaints
Allows residents to raise a complaint with an optional photo.
GET /complaints/mine
Returns the logged-in resident's complaints along with their history.
GET /complaints
Allows admins to view all complaints and filter them by category.
PATCH /complaints/{id}/status
Allows admins to update the complaint status and add a history entry.
PATCH /complaints/{id}/priority
Allows admins to change the complaint priority.

# Notices

GET /notices
Returns all society notices, with important notices shown first.
POST /notices
Allows admins to create a new notice.
DELETE /notices/{id}
Allows admins to remove a notice.

# Dashboard

GET /dashboard
Returns overall complaint statistics, including totals by status, category, and overdue complaints.
Protected endpoints require a JWT token:
Authorization: Bearer <token>

# What I Learned From This Project
This project gave me practical experience in building and deploying a complete full-stack application.

# Some of the main things I worked with were:

Building REST APIs using FastAPI
Implementing JWT authentication and role-based authorization
Designing and managing a PostgreSQL database
Working with SQLAlchemy and Alembic
Uploading and storing images using Cloudinary
Integrating transactional email using Brevo
Creating dashboards and charts using React and Recharts
Connecting a React frontend with a Python backend
Deploying the frontend and backend using Vercel and Render

# Known Limitations:
Backend cold starts: The backend uses Render's free tier, so it can go to sleep after being inactive. The first request after that may take around 30–60 seconds.
Email delivery: Emails sent through the Brevo free tier may occasionally end up in spam depending on the recipient's email provider.
Free-tier hosting: Since the application uses free hosting services, response times may vary compared with a production setup.
