1. src/App.js
jsx
import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Privacy from "./Privacy";

const App = () => {
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || "User"
  );
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Simulated AI feedback based on posture status
  const [postureFeedback, setPostureFeedback] = useState("");

  // Example posture status (would come from real detection)
  const [postureStatus, setPostureStatus] = useState("good"); // "good" or "bad"

  // Example mood (could come from sentiment analysis)
  const [mood, setMood] = useState("calm");

  // Notification reminder interval in minutes
  const REMINDER_INTERVAL = 30;

  // Setup periodic reminders via browser notifications
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    let reminderTimer = null;

    if (Notification.permission === "granted") {
      reminderTimer = setInterval(() => {
        new Notification("PostureWell Reminder", {
          body: "Time to check your posture and take a break!",
          icon: "/favicon.ico",
        });
      }, REMINDER_INTERVAL * 60 * 1000);
    }

    return () => {
      if (reminderTimer) clearInterval(reminderTimer);
    };
  }, []);

  // Simulate AI feedback based on posture status
  useEffect(() => {
    if (postureStatus === "good") {
      setPostureFeedback("Great job! Keep your back straight.");
    } else {
      setPostureFeedback(
        "We've detected slouching. Try sitting up straight or take a quick stretch."
      );
    }
  }, [postureStatus]);

  // Update profile name locally and persist in localStorage
  const updateProfileName = (newName) => {
    setProfileName(newName);
    localStorage.setItem("profileName", newName);
  };

  return (
    <div className="App" style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>PostureWell</h1>
        <button onClick={() => setShowPrivacy(true)} style={{ cursor: "pointer" }}>
          Privacy & Terms
        </button>
      </header>

      <Profile profileName={profileName} updateProfileName={updateProfileName} />

      <div style={{ marginTop: 20 }}>
        <h2>Hello, {profileName}!</h2>
        <p><strong>AI Feedback:</strong> {postureFeedback}</p>
        <button
          onClick={() => setPostureStatus((prev) => (prev === "good" ? "bad" : "good"))}
          style={{ marginBottom: 20 }}
        >
          Simulate Posture Status Change (Current: {postureStatus})
        </button>

        <Dashboard postureStatus={postureStatus} mood={mood} />
      </div>

      {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}

      <footer style={{ marginTop: 50, fontSize: 12, color: "#666" }}>
        <p>© 2025 PostureWell. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
2. src/Profile.js
jsx
import React, { useState } from "react";

const Profile = ({ profileName, updateProfileName }) => {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(profileName);

  const save = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      updateProfileName(trimmed);
      setEditing(false);
    }
  };

  return (
    <div style={{ marginBottom: 30, border: "1px solid #ddd", padding: 15, borderRadius: 5 }}>
      <h3>Profile</h3>
      {editing ? (
        <>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            style={{ fontSize: 16, padding: 5 }}
            aria-label="Edit profile name"
          />
          <button onClick={save} style={{ marginLeft: 10 }}>Save</button>
          <button onClick={() => setEditing(false)} style={{ marginLeft: 10 }}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>Name:</strong> {profileName}</p>
          <button onClick={() => setEditing(true)}>Edit Name</button>
        </>
      )}
    </div>
  );
};

export default Profile;
3. src/Dashboard.js
jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", postureScore: 80, moodLevel: 70 },
  { day: "Tue", postureScore: 75, moodLevel: 60 },
  { day: "Wed", postureScore: 82, moodLevel: 65 },
  { day: "Thu", postureScore: 78, moodLevel: 75 },
  { day: "Fri", postureScore: 85, moodLevel: 80 },
  { day: "Sat", postureScore: 88, moodLevel: 85 },
  { day: "Sun", postureScore: 90, moodLevel: 88 },
];

const Dashboard = ({ postureStatus, mood }) => {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 5, padding: 15 }}>
      <h3>Progress Dashboard</h3>
      <p>
        <strong>Current Posture Status:</strong>{" "}
        <span style={{ color: postureStatus === "good" ? "green" : "red" }}>
          {postureStatus.toUpperCase()}
        </span>
      </p>
      <p><strong>Current Mood:</strong> {mood}</p>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis domain={[50, 100]} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="postureScore" stroke="#8884d8" name="Posture Score (%)" strokeWidth={2} />
          <Line type="monotone" dataKey="moodLevel" stroke="#82ca9d" name="Mood Level (%)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <p style={{ marginTop: 15, fontStyle: "italic", color: "#555" }}>
        Wearable data integration coming soon...
      </p>
    </div>
  );
};

export default Dashboard;
4. src/Privacy.js
jsx
import React from "react";

const Privacy = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      tabIndex={-1}
      style={{
        position: "fixed",
        zIndex: 10,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          maxWidth: 600,
          padding: 20,
          borderRadius: 8,
          overflowY: "auto",
          maxHeight: "90vh",
          boxShadow: "0 4px 8px rgb(0 0 0 / 0.2)",
        }}
      >
        <h2 id="privacy-title">Privacy Policy & Terms</h2>
        <p>
          We collect data strictly to provide posture and wellness insights. Your information is stored securely, never sold or shared without your consent. You can permanently delete your account and data any time.
        </p>
        <h3>Data We Collect</h3>
        <ul>
          <li>Posture status data</li>
          <li>Wellness check-ins and mood inputs</li>
          <li>Profile information (e.g., your name)</li>
        </ul>
        <h3>How We Use Your Data</h3>
        <ul>
          <li>To provide personalized posture and wellness feedback</li>
          <li>To improve user experience and app features</li>
          <li>No sharing with third parties for marketing without explicit consent</li>
        </ul>
        <h3>Your Rights</h3>
        <ul>
          <li>Request full data export</li>
          <li>Request data deletion</li>
          <li>Opt-out of data collection features where possible</li>
        </ul>
        <p>
          For questions, contact us at{" "}
          <a href="mailto:privacy@posturewell.app">privacy@posturewell.app</a>
        </p>
        <button onClick={onClose} style={{ marginTop: 10 }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Privacy;
5. src/index.js
jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
6. src/index.css
css
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  background-color: #f7f9fc;
  color: #333;
}

button {
  background-color: #6593f5;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #4a6ed8;
}

input[type="text"] {
  border: 1px solid #bbb;
  border-radius: 4px;
}
How to run this app locally:
Create a new React app:

bash
npx create-react-app posturewell
cd posturewell
Replace the contents of the src/ folder with the files above.

Install Recharts for the charts:

bash
npm install recharts
Start the app:

bash
npm start
