import React, { useState, useEffect } from "react";

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || "info"}`}>
          <span className="toast-icon">{t.icon || "🎵"}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
