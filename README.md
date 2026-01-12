# HireReady - AI Resume Toolkit

HireReady is a production-grade, AI-powered web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS) and recruiters. It provides instant, actionable feedback, generates quantifiable bullet points, and offers targeted solutions for skill gaps.

![HireReady Hero](https://placehold.co/1200x600/4f46e5/ffffff?text=HireReady+AI+Toolkit)

---

## 🚀 Key Features

### 1. 🔍 Comprehensive Resume Analysis
-   **ATS Score**: Instant 0-100 scoring based on keyword matching and formatting.
-   **Keyword Gap Analysis**: Identifies critical skills missing from your resume compared to the job description.
-   **Content Quality Checks**: Detects passive voice, lack of metrics, and weak action verbs.
-   **Formatting Advice**: Ensures your resume structure is machine-readable.

### 2. ⚡ AI Bullet Point Builder
-   **Context-Aware**: Generates 3 powerful, quantifiable bullet points based on a simple Job Title and Task Description.
-   **Impact Focused**: Ensures every bullet point uses strong action verbs and metrics (e.g., "Increased efficiency by 20%...").

### 3. 🎯 Targeted Skill Gap Solutions
-   **Smart Suggestions**: Automatically generates bullet point suggestions for *specific* missing skills found in the analysis.
-   **One-Click Integration**: Helps users bridge the gap between their experience and the job requirements.

### 4. 🗂️ History & Draft Management
-   **Auto-Save**: Automatically saves your analysis results and drafts.
-   **Version Control**: Keep track of different versions of your resume for different job applications.
-   **Guest Mode**: Try the full feature set without creating an account (data is not persisted).

### 5. 🔐 Secure & Responsive
-   **JWT Authentication**: Secure stateless login and signup.
-   **Mobile Optimized**: Fully responsive interface that works great on phones, tablets, and desktops.
-   **Modern UI**: Built with React and Tailwind CSS for a premium user experience.

---

## 🛠️ Technology Stack

-   **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons
-   **Backend**: Flask (Python), Gunicorn
-   **AI Engine**: Google Gemini 2.5 Flash (via `google-generativeai` SDK)
-   **Database**: MongoDB Atlas (Cloud)
-   **Authentication**: PyJWT (Stateless JSON Web Tokens)
-   **Deployment**: Vercel (Frontend) + Render (Backend)

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
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### 3. Frontend Setup (React)
```bash
# Open a new terminal in the root directory
cd ..
npm install
npm run dev
```

### 4. Environment Variables
Create a `.env` file in the `backend/` folder:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hireready
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_ai_studio_key
```

Then open **[http://localhost:5173](http://localhost:5173)** to launch the app.

---

## 🚀 Deployment

-   **Frontend**: Deployed on **Vercel** ([Live Demo Link Here](https://hire-ready-psi.vercel.app/))
-   **Backend**: Deployed on **Render** (Auto-sleeping on free tier, wakes up in <50s)

---

## 👩‍💻 Author

**Prerna Kale**
*   B.Tech Computer Engineering
*   Building AI-driven solutions for real-world problems.

---

## 🏷️ License
This project is for academic and demonstration purposes.
