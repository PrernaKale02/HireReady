import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key, transport='rest')

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Hello, are you working? Reply with 'Yes, I am working with the Python SDK!'")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Structured output test
print("\n--- Testing Structured Output ---")
for model_name in ["gemini-2.5-flash", "gemini-2.5-pro"]: # Add other models if needed
    print(f"Testing model: {model_name}...")
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "status": {"type": "STRING"},
                        "details": {
                            "type": "OBJECT",
                            "properties": {"info": {"type": "STRING"}}
                        }
                    }
                }
            }
        )
        response = model.generate_content("Return this JSON: {'status': 'Working', 'details': {'info': 'Complex'}}")
        print(f"✅ SUCCESS with {model_name}!")
        print(f"Response: {response.text}")
        break # Stop after the first successful model
    except Exception as e:
        print(f"❌ Failed with {model_name}: {e}")
print("--- Structured Output Test Complete ---")
