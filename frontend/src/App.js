import { useState } from "react";
import "./App.css";

function App() {
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [generated, setGenerated] = useState(false);

  // Toggle show/hide answer
  const toggleAnswer = (index) => {
    setVisibleAnswers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Call FastAPI backend
  const generateQuestions = async () => {
    if (!jobRole.trim()) {
      alert("Please enter a job role!");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setGenerated(false);
    setVisibleAnswers({});

    const response = await fetch(
      "https://interview-prep-backend-puj1.onrender.com/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_role: jobRole,
          experience_level: experienceLevel,
        }),
      },
    );

    const data = await response.json();
    setQuestions(data.questions);
    setLoading(false);
    setGenerated(true);
  };

  // Download as text file
  const downloadResult = () => {
    const content = questions
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
      .join("\n\n");

    const blob = new Blob(
      [`AI INTERVIEW PREP\nJob Role: ${jobRole}\n\n${content}`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Interview_Questions_${jobRole}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setJobRole("");
    setExperienceLevel("Fresher");
    setQuestions([]);
    setGenerated(false);
    setVisibleAnswers({});
  };

  return (
    <div className="app">
      {/* HEADER */}
      <div className="header">
        <h1>🎯 Interview Prep</h1>
        <p>Enter your job role and get interview questions with answers!</p>
      </div>

      {/* FORM */}
      <div className="form-box">
        <div className="form-row">
          <div className="form-group">
            <label>💼 Job Role</label>
            <input
              type="text"
              placeholder="e.g. Python Developer, Data Analyst..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>📊 Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option>Fresher</option>
              <option>Junior</option>
              <option>Senior</option>
            </select>
          </div>
        </div>
        <button onClick={generateQuestions} disabled={loading}>
          {loading ? "⏳ Generating..." : "Generate Questions"}
        </button>
      </div>

      {/* QUESTIONS */}
      {generated && (
        <div className="results">
          <h2>
            📋 Interview Questions for <span>{jobRole}</span>
          </h2>

          {questions.map((q, index) => (
            <div className="question-card" key={index}>
              <div className="question">
                <span className="q-number">Q{index + 1}</span>
                <p>{q.question}</p>
              </div>
              <button
                className="toggle-btn"
                onClick={() => toggleAnswer(index)}
              >
                {visibleAnswers[index] ? "🙈 Hide Answer" : "👁️ Show Answer"}
              </button>
              {visibleAnswers[index] && (
                <div className="answer">
                  <p>{q.answer}</p>
                </div>
              )}
            </div>
          ))}

          {/* ACTION BUTTONS */}
          <div className="action-buttons">
            <button onClick={downloadResult}>⬇️ Download Questions</button>
            <button className="reset-btn" onClick={reset}>
              🔄 Try Another Role
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">Built with React, FastAPI & Groq AI</div>
    </div>
  );
}

export default App;
