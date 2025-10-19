# HireReady

HireReady is a full-stack, AI-powered web application designed to analyze, improve, and manage resumes. It provides users with instant, actionable feedback on structure, tone, content quality, and ATS compatibility. The platform supports multiple resume drafts, tracks version history, and gives insights into skill gaps, helping job seekers craft resumes that stand out to both recruiters and automated screening systems.

---

## 🚀 Overview

HireReady is a full-stack web app designed to analyze and enhance resumes using AI.
It allows users to create, edit, and compare multiple resume drafts, while receiving instant AI feedback on structure, tone, and job-readiness.
The app has a clean, professional interface and provides both authenticated and guest user modes — so anyone can jump in and start optimizing their resume instantly.
It’s perfect for students, job seekers, and career coaches.

---

## 🧠 Features

- Secure Authentication: Sign up, sign in, and guest mode with persistent sessions.
- Resume Draft Management: Create, edit, save, delete, and compare multiple drafts.
- JD & Resume Input: Upload PDFs or paste text for both resumes and job descriptions.
- AI-Powered Feedback: Get scores, strengths, weaknesses, and improvement suggestions.
- Skill & Keyword Analysis: Identify gaps and optimize resumes for ATS.
- Version History: Track all drafts with AI scores.
- Smart Dashboard: Visual, categorized feedback for clarity and actionable insights.
- Backend API: Flask REST endpoints for authentication, resume management, and AI integration.
- Modern UI: React + Tailwind for responsive, clean, and intuitive design.

---

## ⚙️ Tech Stack

**Frontend:** React.js  
**Backend:** Flask (Python)  
**Database:** MySQL  
**Version Control:** Git & GitHub

---

## 🧩 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PrernaKale02/HireReady.git
cd HireReady
```

### 2. Backend Setup (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup (React)

```bash
npm install
npm run dev
```

### 4. Database Setup (MySQL)

- Create a MySQL database, e.g., `hireready_db`.
- Manually create the required tables as per the schema used in the app.
- Update the database credentials in `backend/app.py` if needed.

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👩‍💻 Author

**Prerna Kale**
B.Tech Computer Engineering

---

## 🏷️ License

This project is for **academic and demonstration purposes** only.
