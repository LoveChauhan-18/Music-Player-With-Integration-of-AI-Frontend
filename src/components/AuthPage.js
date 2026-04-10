// src/components/AuthPage.js
import React, { useState } from "react";
import { authService } from "../services/authService";

export default function AuthPage({ onLoginSuccess, setActivePage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(username, password);
        onLoginSuccess(username);
      } else {
        // 1. Create account
        await authService.register(username, email, password);
        
        // 2. Automatically log in the user
        await authService.login(username, password);
        
        // 3. Trigger success flow
        onLoginSuccess(username);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">🎵</div>
          <h1 className="auth-title">
            {isLogin ? "Welcome Back" : "Join the Vibe"}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? "Log in to access your personal beats" : "Create an account to start your AI journey"}
          </p>
        </div>

        {error && (
          <div className="auth-error animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group animate-slide-down">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <div className="loading-spinner-sm" />
            ) : (
              isLogin ? "Log In" : "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="auth-toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
          <button className="btn-text" style={{ marginTop: 12, opacity: 0.6 }} onClick={() => setActivePage("home")}>
            Skip for now
          </button>
        </div>
      </div>

      <style>{`
        .auth-container {
          position: fixed;
          inset: 0;
          background: #09090b;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          overflow: hidden;
        }

        .auth-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          z-index: 0;
          animation: float 20s infinite alternate;
        }

        .auth-glow-1 {
          background: #8b5cf6;
          top: -100px;
          left: -100px;
        }

        .auth-glow-2 {
          background: #06b6d4;
          bottom: -100px;
          right: -100px;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, 50px) scale(1.1); }
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: 24px;
          position: relative;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          font-size: 42px;
          margin-bottom: 16px;
        }

        .auth-title {
          font-size: 28px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-left: 4px;
        }

        .form-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px 16px;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
          background: rgba(255, 255, 255, 0.08);
          outline: none;
        }

        .auth-submit-btn {
          margin-top: 10px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.4);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .auth-toggle-btn {
          background: none;
          border: none;
          color: #8b5cf6;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 12px;
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
