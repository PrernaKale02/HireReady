import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Hello, are you working? Reply with 'Yes, I am working with the Python SDK!'")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
