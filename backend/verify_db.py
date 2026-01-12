import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.environ.get("MONGO_URI")

if not mongo_uri:
    print("❌ MONGO_URI not found in .env file")
    exit(1)

print(f"Attempting to connect with URI length: {len(mongo_uri)}")
# Masking the URI for security in logs, only showing protocol
print(f"URI starts with: {mongo_uri.split('://')[0]}")

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Trigger a connection to see if it fails
    print("Successfully connected to MongoDB Atlas!")
    
    db = client.get_database("hireready")
    print(f"Database 'hireready' selected.")
    
except Exception as e:
    print(f"Connection failed: {e}")
    exit(1)
