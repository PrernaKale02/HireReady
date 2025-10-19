import os
import json
import requests
import time
import bcrypt 
import mysql.connector 
from flask import Flask, request, jsonify, g, send_file
from flask_cors import CORS
from datetime import datetime
from pypdf import PdfReader
from docx import Document

API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"

MYSQL_CONFIG = {
    "host": os.environ.get("MYSQL_HOST"),
    "user": os.environ.get("MYSQL_USER"),
    "password": os.environ.get("MYSQL_PASSWORD"), 
    "database": os.environ.get("MYSQL_DATABASE"),
}

app = Flask(__name__)
CORS(app) 

ACTIVE_SESSIONS = {} 

def get_db_connection():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def get_user_id_from_token(token):
    session = ACTIVE_SESSIONS.get(token)
    return session.get('user_id') if session else None

def extract_text_from_pdf(file_path):
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None
    return text.strip()

def extract_text_from_docx(file_path):
    text = ""
    try:
        document = Document(file_path)
        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return None
    return text.strip()

@app.route('/upload_file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    filename = file.filename
    temp_path = os.path.join('/tmp', filename) 
    file.save(temp_path)
    
    extracted_text = ""
    mime_type = file.mimetype
    
    try:
        if mime_type == 'application/pdf':
            extracted_text = extract_text_from_pdf(temp_path)
        elif mime_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']:
            extracted_text = extract_text_from_docx(temp_path)
        else:
            return jsonify({"error": "Unsupported file type. Please upload a PDF or DOCX."}), 415

        if not extracted_text:
            return jsonify({"error": "Could not extract text from the file. Try copy/pasting instead."}), 500
        
        return jsonify({"extracted_text": extracted_text}), 200

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"error": "Missing username, email, or password."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Could not connect to database."}), 500
    
    try:
        cursor = conn.cursor()
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        query = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
        cursor.execute(query, (username, email, hashed_password))
        conn.commit()
        
        user_id = cursor.lastrowid
        token = str(user_id) 
        ACTIVE_SESSIONS[token] = {'user_id': user_id, 'username': username}

        return jsonify({"message": "User created successfully.", "user_id": user_id, "username": username, "token": token}), 201
        
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({"error": "Username or Email already exists."}), 409
        print(f"MySQL Error during signup: {err}")
        return jsonify({"error": "Database error during signup."}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing email or password."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Could not connect to database."}), 500
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, username, password_hash FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        
        if user:
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                token = str(user['id'])
                ACTIVE_SESSIONS[token] = {'user_id': user['id'], 'username': user['username']}
                
                return jsonify({
                    "message": "Sign in successful.", 
                    "user_id": user['id'], 
                    "username": user['username'], 
                    "token": token
                }), 200
            else:
                return jsonify({"error": "Invalid email or password."}), 401
        else:
            return jsonify({"error": "Invalid email or password."}), 401
            
    except mysql.connector.Error as err:
        print(f"MySQL Error during signin: {err}")
        return jsonify({"error": "Database error during signin."}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/save_analysis', methods=['POST'])
def save_analysis():
    data = request.get_json()
    token = data.get('token')
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({"error": "Authentication required to save data."}), 401

    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')
    analysis_result = data.get('analysis_result')
    target_job_title = data.get('target_job_title', 'Untitled Analysis')
    ats_score = analysis_result.get('ats_score', 0) if analysis_result else 0

    if not analysis_result:
        return jsonify({"error": "Missing analysis results to save."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Could not connect to database."}), 500
    
    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO resume_analyses 
        (user_id, resume_text, job_description, ats_score, analysis_json, target_job_title) 
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        analysis_json_str = json.dumps(analysis_result)

        cursor.execute(query, (user_id, resume_text, job_description, ats_score, analysis_json_str, target_job_title))
        conn.commit()
        
        return jsonify({"message": "Analysis saved successfully!", "id": cursor.lastrowid}), 201
        
    except mysql.connector.Error as err:
        print(f"MySQL Error during save: {err}")
        return jsonify({"error": "Database error during save operation."}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/get_history', methods=['POST'])
def get_history():
    data = request.get_json()
    token = data.get('token')
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({"error": "Authentication required to view history."}), 401

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Could not connect to database."}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, ats_score, target_job_title, created_at, resume_text, job_description, analysis_json FROM resume_analyses WHERE user_id = %s ORDER BY created_at DESC"
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()
        
        history = []
        for row in results:
            if row['analysis_json']:
                row['analysis_json'] = json.loads(row['analysis_json'])
            else:
                row['analysis_json'] = {}
            
            row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            history.append(row)
            
        return jsonify({"history": history}), 200
        
    except mysql.connector.Error as err:
        print(f"MySQL Error during history retrieval: {err}")
        return jsonify({"error": "Database error during history retrieval."}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/delete_analysis', methods=['POST'])
def delete_analysis():
    data = request.get_json()
    token = data.get('token')
    draft_id = data.get('draft_id')
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({"error": "Authentication required to delete drafts."}), 401
    if not draft_id:
        return jsonify({"error": "Draft ID is required."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Could not connect to database."}), 500
    
    try:
        cursor = conn.cursor()
        query = "DELETE FROM resume_analyses WHERE id = %s AND user_id = %s"
        cursor.execute(query, (draft_id, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
             return jsonify({"error": "Draft not found or unauthorized."}), 404
             
        return jsonify({"message": "Draft deleted successfully!"}), 200
        
    except mysql.connector.Error as err:
        print(f"MySQL Error during deletion: {err}")
        return jsonify({"error": "Database error during deletion."}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "ats_score": {
            "type": "INTEGER",
            "description": "A score from 1 to 100 representing the ATS and keyword match between the resume and the job description. Higher is better."
        },
        "feedback": {
            "type": "OBJECT",
            "properties": {
                "keyword_gaps": {
                    "type": "ARRAY",
                    "description": "A list of critical skills or keywords from the job description that are missing or weakly present in the resume.",
                    "items": {"type": "STRING"}
                },
                "keyword_strengths": {
                    "type": "ARRAY",
                    "description": "A list of skills or experiences from the resume that perfectly match the job description's requirements.",
                    "items": {"type": "STRING"}
                },
                "content_improvements": {
                    "type": "ARRAY",
                    "description": "Actionable advice on improving the content and style (e.g., replace passive voice, quantify a specific bullet point, use stronger action verbs).",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "type": {"type": "STRING", "enum": ["improvement", "strength"]},
                            "detail": {"type": "STRING", "description": "The specific advice or observation."}
                        },
                        "propertyOrdering": ["type", "detail"]
                    }
                },
                "formatting_advice": {
                    "type": "ARRAY",
                    "description": "Suggestions on readability, length, and formatting (e.g., font consistency, section hierarchy, removing non-ATS friendly elements).",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "type": {"type": "STRING", "enum": ["improvement", "strength"]},
                            "detail": {"type": "STRING", "description": "The specific advice or observation."}
                        },
                        "propertyOrdering": ["type", "detail"]
                    }
                },
            },
            "propertyOrdering": ["keyword_gaps", "keyword_strengths", "content_improvements", "formatting_advice"]
        }
    },
    "propertyOrdering": ["ats_score", "feedback"]
}

BULLET_POINT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "job_title": {"type": "STRING", "description": "The professional job title used for context."},
        "generated_bullets": {
            "type": "ARRAY",
            "description": "A list of three highly-polished, quantifiable, and action-oriented resume bullet points.",
            "items": {"type": "STRING"}
        }
    },
    "propertyOrdering": ["job_title", "generated_bullets"]
}

SUGGESTION_SCHEMA = {
    "type": "ARRAY",
    "description": "A list of suggested bullet points, one for each skill gap.",
    "items": {
        "type": "OBJECT",
        "properties": {
            "skill": {"type": "STRING", "description": "The specific missing keyword/skill that this bullet addresses."},
            "bullet": {"type": "STRING", "description": "A strong, quantifiable, and action-oriented bullet point suggestion on how to integrate this skill into the user's resume, based on common experience for the target job."}
        },
        "propertyOrdering": ["skill", "bullet"]
    }
}

TEMPLATE_OPTIONS = [
    "Chronological/Traditional (Best for steady career progression)", 
    "Functional/Skills-Based (Best for career changers or gap coverage)", 
    "Hybrid/Combination (Best balance of skills and experience depth)", 
    "Technical/Project-Focused (Best for engineers/developers)"
]

TEMPLATE_RECOMMENDATION_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "best_template_type": {
            "type": "STRING",
            "description": "The single best-suited template from the options provided, e.g., 'Chronological/Traditional'."
        },
        "justification": {
            "type": "STRING",
            "description": "A 1-2 sentence explanation of why this template is the best match for the user's resume and the target job."
        },
        "available_templates": {
            "type": "ARRAY",
            "description": "The list of available templates, with a score and brief compatibility reason for each.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "template_name": {"type": "STRING", "enum": TEMPLATE_OPTIONS},
                    "compatibility_score": {"type": "INTEGER", "description": "Score from 1 to 100."},
                    "reason": {"type": "STRING", "description": "1 sentence on why this template is a good/bad match."}
                },
                "propertyOrdering": ["template_name", "compatibility_score", "reason"]
            }
        }
    },
    "propertyOrdering": ["best_template_type", "justification", "available_templates"]
}

SECTION_REFINEMENT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "section_title": {"type": "STRING", "description": "The title of the section being refined (e.g., 'Experience', 'Summary')."},
        "suggested_rewrites": {
            "type": "ARRAY",
            "description": "A list of suggested changes for the section.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "original_text_snippet": {"type": "STRING", "description": "A short snippet (5-10 words) of the text being replaced/modified."},
                    "suggested_bullet": {"type": "STRING", "description": "The new, refined, quantifiable, and keyword-rich bullet point or sentence."}
                },
                "propertyOrdering": ["original_text_snippet", "suggested_bullet"]
            }
        }
    },
    "propertyOrdering": ["section_title", "suggested_rewrites"]
}

def call_gemini_with_retry(payload, schema_name):
    if not API_KEY:
        raise Exception("Gemini API Key is not configured in app.py.")

    headers = {'Content-Type': 'application/json'}
    max_retries = 5
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={API_KEY}", 
                headers=headers, 
                json=payload, 
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('candidates') and result['candidates'][0].get('content'):
                json_text = result['candidates'][0]['content']['parts'][0]['text']
                return json.loads(json_text)
            else:
                raise Exception("LLM response was empty or malformed.")

        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt 
                time.sleep(wait_time)
            else:
                print(f"API call failed after {max_retries} attempts.")
                raise e
        except Exception as e:
            print(f"Error processing LLM response ({schema_name}): {e}")
            raise Exception(f"Failed to process LLM response: {e}")

    raise Exception("Gemini API call failed after multiple retries.")

def call_gemini_analysis(resume_text, job_description):
    system_prompt = (
        "You are a world-class resume analyzer and Applicant Tracking System (ATS). "
        "Your task is to compare the provided resume text against the target job description. "
        "Generate a structured JSON response based ONLY on the provided schema. "
        "The analysis must focus on ATS compatibility, keyword matching, and content quality (using action verbs and quantifiable results). "
        "Be critical, specific, and actionable."
    )
    user_query = (
        f"Analyze the following resume against the job description. "
        f"Resume: ```{resume_text}```\n\n"
        f"Job Description: ```{job_description}```\n\n"
        f"Provide a structured analysis and an ATS score (1-100)."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": ANALYSIS_SCHEMA
        }
    }
    return call_gemini_with_retry(payload, "ANALYSIS_SCHEMA")

def call_gemini_bullet_generator(job_title, task_description):
    system_prompt = (
        "You are a professional resume writer specializing in generating impactful, quantifiable, "
        "and results-oriented bullet points. Use strong action verbs and metrics. "
        "Your response MUST adhere strictly to the BULLET_POINT_SCHEMA."
    )
    user_query = (
        f"Generate three unique, powerful resume bullet points for a candidate with the Job Title: '{job_title}' "
        f"who performed the Task: '{task_description}'. Each bullet point should start with a strong action verb and include a quantifiable result."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": BULLET_POINT_SCHEMA
        }
    }
    return call_gemini_with_retry(payload, "BULLET_POINT_SCHEMA")

def call_gemini_skill_suggester(resume_text, job_description, keyword_gaps):
    system_prompt = (
        "You are a strategic career advisor. For each skill listed in the 'keyword_gaps' array, "
        "generate one highly-polished, quantifiable, and action-oriented bullet point that the user "
        "could plausibly add to their resume to cover that specific skill, based on the general context of the "
        "target job description. You MUST return a JSON array conforming to the SUGGESTION_SCHEMA. "
        "Each bullet must clearly demonstrate how a project or experience could show that skill. "
        "Do NOT use bullet points that are already present in the user's resume."
    )
    user_query = (
        f"Target Job Description: ```{job_description}```\n\n"
        f"User's Current Resume (for context/to avoid duplication): ```{resume_text}```\n\n"
        f"CRITICAL MISSING SKILLS TO PROVIDE BULLET POINTS FOR: {', '.join(keyword_gaps)}\n\n"
        f"For each missing skill, provide ONE suggested bullet point."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": SUGGESTION_SCHEMA
        }
    }
    return call_gemini_with_retry(payload, "SUGGESTION_SCHEMA")

def call_gemini_template_selector(resume_text, job_description):
    system_prompt = (
        "You are a professional resume strategist. Recommend the best template structure "
        "from the list provided that maximizes the user's appeal to an ATS and a recruiter "
        "for the target job."
    )
    template_list_str = "\n".join([f"- {opt}" for opt in TEMPLATE_OPTIONS])
    user_query = (
        f"Available Templates:\n{template_list_str}\n\n"
        f"Analyze the User's Resume:\n```{resume_text}```\n\n"
        f"Against the Target Job Description:\n```{job_description}```\n\n"
        f"Provide your structured recommendation based ONLY on the schema."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": TEMPLATE_RECOMMENDATION_SCHEMA,
            "temperature": 0.1
        }
    }
    return call_gemini_with_retry(payload, "TEMPLATE_RECOMMENDATION_SCHEMA")

def call_gemini_initial_draft(resume_text, job_description, analysis_result):
    system_prompt = (
        "You are an expert resume editor. Your task is to take the user's raw resume text "
        "and the analysis feedback and produce a single, CLEAN, slightly optimized text draft. "
        "Integrate the 'keyword_gaps' subtly, enhance the 'content_improvements' where possible, "
        "and retain the overall structure. Do NOT add extra formatting (like HTML tags). "
        "Return ONLY the modified resume text as a string inside a simple JSON object: {'modified_draft': '...'}."
    )
    
    user_query = (
        f"Raw Resume Text:\n```{resume_text}```\n\n"
        f"Target Job Description:\n```{job_description}```\n\n"
        f"Analysis Feedback to Incorporate:\n{json.dumps(analysis_result.get('feedback', {}), indent=2)}\n\n"
        f"Produce the single, clean, modified resume text."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {"type": "OBJECT", "properties": {"modified_draft": {"type": "STRING"}}},
            "temperature": 0.3
        }
    }
    return call_gemini_with_retry(payload, "INITIAL_DRAFT_SCHEMA")

def call_gemini_section_refiner(section_text, job_description):
    system_prompt = (
        "You are a hyper-specific resume refinement tool. For the provided resume section, "
        "generate 2-3 precise, quantifiable, and keyword-rich rewrite suggestions for the "
        "existing bullet points or sentences, focusing entirely on the target job description. "
        "Ensure the suggestions are action-verb focused and metric-driven. "
        "Return ONLY the structured JSON object."
    )
    
    user_query = (
        f"Target Job Description (for context):\n```{job_description}```\n\n"
        f"Resume Section Text to Refine:\n```{section_text}```\n\n"
        f"Generate structured rewrite suggestions."
    )
    
    payload = {
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": SECTION_REFINEMENT_SCHEMA,
            "temperature": 0.5
        }
    }
    return call_gemini_with_retry(payload, "SECTION_REFINEMENT_SCHEMA")

@app.route('/analyze_resume', methods=['POST'])
def analyze_resume():
    try:
        data = request.get_json()
        resume_text = data.get('resume', '')
        job_description = data.get('job_description', '')

        if not resume_text or not job_description:
            return jsonify({"error": "Both resume and job description are required."}), 400

        analysis_result = call_gemini_analysis(resume_text, job_description)
        return jsonify(analysis_result), 200

    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

@app.route('/generate_bullet_points', methods=['POST'])
def generate_bullet_points():
    try:
        data = request.get_json()
        job_title = data.get('job_title', '').strip()
        task_description = data.get('task_description', '').strip()

        if not job_title or not task_description:
            return jsonify({"error": "Both job title and task description are required."}), 400

        generation_result = call_gemini_bullet_generator(job_title, task_description)
        return jsonify(generation_result), 200

    except Exception as e:
        print(f"An error occurred during bullet generation: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

@app.route('/suggest_skill_bullets', methods=['POST'])
def suggest_skill_bullets():
    try:
        data = request.get_json()
        resume_text = data.get('resume', '')
        job_description = data.get('job_description', '')
        keyword_gaps = data.get('keyword_gaps', [])

        if not resume_text or not job_description or not keyword_gaps:
            return jsonify({"error": "Resume, job description, and keyword gaps are required for targeted suggestions."}), 400

        generation_result = call_gemini_skill_suggester(resume_text, job_description, keyword_gaps)
        return jsonify({"suggestions": generation_result}), 200

    except Exception as e:
        print(f"An error occurred during skill suggestion generation: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

@app.route('/recommend_template', methods=['POST'])
def recommend_template():
    try:
        data = request.get_json()
        resume_text = data.get('resume', '')
        job_description = data.get('job_description', '')

        if not resume_text or not job_description:
            return jsonify({"error": "Both resume and job description are required."}), 400

        recommendations = call_gemini_template_selector(resume_text, job_description)
        return jsonify(recommendations), 200

    except Exception as e:
        print(f"An error occurred during template recommendation: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

@app.route('/generate_initial_draft', methods=['POST'])
def generate_initial_draft():
    try:
        data = request.get_json()
        resume_text = data.get('resume', '')
        job_description = data.get('job_description', '')
        analysis_result = data.get('analysis_result', {})

        if not resume_text or not job_description or not analysis_result:
            return jsonify({"error": "Resume, JD, and Analysis are required."}), 400

        draft_result = call_gemini_initial_draft(resume_text, job_description, analysis_result)
        return jsonify(draft_result), 200

    except Exception as e:
        print(f"An error occurred during draft generation: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

@app.route('/refine_section', methods=['POST'])
def refine_section():
    try:
        data = request.get_json()
        section_text = data.get('section_text', '')
        job_description = data.get('job_description', '')

        if not section_text or not job_description:
            return jsonify({"error": "Section text and job description are required."}), 400

        refinement_result = call_gemini_section_refiner(section_text, job_description)
        return jsonify(refinement_result), 200

    except Exception as e:
        print(f"An error occurred during section refinement: {e}")
        return jsonify({"error": f"AI Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    if not os.path.exists('/tmp'):
        os.makedirs('/tmp')
        
    print("Testing MySQL connection...")
    test_conn = get_db_connection()
    if test_conn:
        print("MySQL connection successful!")
        test_conn.close()
    else:
        print("WARNING: MySQL connection failed. Check MYSQL_CONFIG in app.py and ensure the DB is running.")

    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True)
