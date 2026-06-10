from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# MongoDB client
mongo = MongoClient(os.getenv("MONGODB_URL"), tls=True, tlsAllowInvalidCertificates=True)
db = mongo["interview_prep_db"]
collection = db["sessions"]

# -----------------------------------------------
# REQUEST MODEL
# -----------------------------------------------
class InterviewRequest(BaseModel):
    job_role: str
    experience_level: str

# -----------------------------------------------
# HOME ROUTE
# -----------------------------------------------
@app.get("/")
def home():
    return {"message": "Interview Prep API is running!"}

# -----------------------------------------------
# GENERATE QUESTIONS ROUTE
# -----------------------------------------------
@app.post("/generate")
def generate_questions(request: InterviewRequest):

    prompt = f"""
    You are an expert technical interviewer.

    Generate 5 interview questions with detailed model answers for the following:
    Job Role: {request.job_role}
    Experience Level: {request.experience_level}

    Reply in this EXACT format:

    Q1: Your question here
    A1: Your detailed answer here

    Q2: Your question here
    A2: Your detailed answer here

    Q3: Your question here
    A3: Your detailed answer here

    Q4: Your question here
    A4: Your detailed answer here

    Q5: Your question here
    A5: Your detailed answer here
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    result = response.choices[0].message.content

    # Parse Q&A pairs
    questions = []
    lines = result.strip().split("\n")
    current_q = None
    current_a = None

    for line in lines:
        line = line.strip()
        if line.startswith("Q") and ":" in line:
            current_q = line.split(":", 1)[1].strip()
        elif line.startswith("A") and ":" in line:
            current_a = line.split(":", 1)[1].strip()
            if current_q and current_a:
                questions.append({
                    "question": current_q,
                    "answer": current_a
                })
                current_q = None
                current_a = None

    # Save to MongoDB
    session = {
        "job_role": request.job_role,
        "experience_level": request.experience_level,
        "questions": questions,
        "created_at": datetime.now().isoformat()
    }
    collection.insert_one(session)

    return {"job_role": request.job_role, "questions": questions}

# -----------------------------------------------
# GET HISTORY ROUTE
# -----------------------------------------------
@app.get("/history")
def get_history():
    sessions = list(collection.find({}, {"_id": 0}).sort("created_at", -1).limit(5))
    return {"sessions": sessions}