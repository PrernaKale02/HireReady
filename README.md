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

### 4. Database & AI Setup (MongoDB & Gemini)

- **MongoDB**: Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
- **Gemini AI**: Get an API key from [Google AI Studio](https://aistudio.google.com/).
- **Config**: Create a `backend/.env` file:
    ```env
    MONGO_URI=mongodb+srv://<user>:<pass>@...
    JWT_SECRET=your_secret_key
    GEMINI_API_KEY=your_gemini_key
    ```

Then open **[http://localhost:5173](http://localhost:5173)** (or the port shown in your terminal) in your browser.

---

## 🚀 Deployment Guide

### Backend (Render.com Recommended)
1.  Push your code to GitHub.
2.  Go to **Render** -> New -> **Web Service**.
3.  Connect your repo.
4.  **Root Directory**: `backend` (Important!).
5.  **Build Command**: `pip install -r requirements.txt`.
6.  **Start Command**: `gunicorn app:app`.
7.  **Environment Variables**: Add `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
8.  Deploy! Copy the resulting URL (e.g., `https://hire-ready-api.onrender.com`).

### Frontend (Vercel Recommended)
1.  Go to **Vercel** -> Add New -> Project.
2.  Connect your repo.
3.  **Framework Preset**: Vite.
4.  **Environment Variables**: Add `VITE_API_URL` -> Value = Your Backend URL from above (No trailing slash).
5.  Deploy!

---

## 👩‍💻 Author

**Prerna Kale**
B.Tech Computer Engineering

---

## 🏷️ License

This project is for **academic and demonstration purposes** only.
