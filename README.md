# Interview Prep

AI-assisted web application that creates interview questions based on roles with example answers.

## Live Demo
https://interview-prep-frontend-ncyx.onrender.com/

## Technology Stack
- Frontend: React.js
- Backend: FastAPI (Python)
- Database: MongoDB Atlas
- AI: Groq API (LLaMA 3.3)
- Deployment: Render.com

## Features
- Generate five interview questions based on the job role
- Categorize by experience (Fresher, Junior, Senior)
- Toggle answers for practice mode
- Export interview questions in text format

## How to Run Locally
1. Fork repository
2. Insert your credentials into backend/.env
3. Start backend server using `uvicorn main:app --reload`
4. Run frontend server using `npm start`
