import React, { useState } from "react";
import { VOICE_TYPES, GENRES } from "../data/songs";

const SONG_THEMES = [
  "Love & Romance", "Heartbreak", "Adventure", "Party Night", "Self-Discovery",
  "Nostalgia", "Hope & Resilience", "Celebration", "Nature & Peace", "Hustle & Grind",
  "Friendship", "Social Justice", "Fantasy", "Late Night Vibes", "Custom",
];

const GENERATION_STEPS = [
  { label: "Analyzing theme & lyrics...", icon: "📝" },
  { label: "Composing melody structure...", icon: "🎼" },
  { label: "Synthesizing vocal track...", icon: "🎤" },
  { label: "Adding instruments & beats...", icon: "🥁" },
  { label: "Mastering audio quality...", icon: "🎚️" },
  { label: "Song generation complete!", icon: "✅" },
];

export default function SongCreatorPage({ onAddGenerated }) {
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [voice, setVoice] = useState("");
  const [genre, setGenre] = useState("");
  const [tempo, setTempo] = useState("Medium");
  const [lyrics, setLyrics] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generatedSong, setGeneratedSong] = useState(null);

  const isFormValid = (theme || customTheme) && voice && lyrics.trim().length > 10;

  const handleGenerate = () => {
    if (!isFormValid) return;
    setGenerating(true);
    setGeneratedSong(null);
    setGenStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setGenStep(step);
      if (step >= GENERATION_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          const finalTheme = theme === "Custom" ? customTheme : theme;
          const title = songTitle.trim() ||
            `${finalTheme || "My Song"} (AI Generated)`;

          const generated = {
            id: Date.now(),
            title,
            artist: "NeuraBeats AI",
            album: "AI Creations",
            duration: Math.floor(Math.random() * 60) + 180,
            genre: genre || "Pop",
            mood: ["happy", "energetic"],
            emoji: "🤖",
            color: "#06b6d4",
            year: 2026,
            plays: 0,
            isAIGenerated: true,
            meta: { theme: finalTheme, voice, genre, tempo, lyrics },
          };
          setGeneratedSong(generated);
          setGenerating(false);
          if (onAddGenerated) onAddGenerated(generated);
        }, 600);
      }
    }, 900);
  };

  const handleReset = () => {
    setGeneratedSong(null);
    setTheme("");
    setCustomTheme("");
    setVoice("");
    setGenre("");
    setTempo("Medium");
    setLyrics("");
    setSongTitle("");
    setGenStep(0);
  };

  return (
    <div className="page">
      <div className="creator-panel">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span className="ai-badge" style={{
                background: "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(139,92,246,0.2))",
                borderColor: "rgba(6,182,212,0.3)",
                color: "var(--accent-cyan)",
              }}>
                🎤 AI Song Creator
              </span>
            </div>
            <h2 className="ai-panel-title">Create Your Own Song</h2>
            <p className="ai-panel-sub">
              Provide a theme, voice type, and lyrics — our AI will compose and generate a full song for you.
            </p>
          </div>
          <div style={{ fontSize: 64, animation: "float 3s ease infinite 0.5s" }}>✨</div>
        </div>

        {!generatedSong && (
          <div className="creator-form">
            {/* Song Title */}
            <div className="form-field">
              <label className="form-label">Song Title (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Moonlit Dreams"
                value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
              />
            </div>

            {/* Theme */}
            <div className="form-field">
              <label className="form-label">Song Theme *</label>
              <select
                className="form-select"
                value={theme}
                onChange={e => setTheme(e.target.value)}
              >
                <option value="">Select a theme...</option>
                {SONG_THEMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Custom Theme */}
            {theme === "Custom" && (
              <div className="form-field form-full">
                <label className="form-label">Custom Theme Description *</label>
                <input
                  className="form-input"
                  placeholder="Describe your song theme..."
                  value={customTheme}
                  onChange={e => setCustomTheme(e.target.value)}
                />
              </div>
            )}

            {/* Voice Type */}
            <div className="form-field">
              <label className="form-label">Voice Type *</label>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  className="form-select"
                  value={voice}
                  onChange={e => setVoice(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select voice type...</option>
                  {VOICE_TYPES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="user_voice">Custom Voice (Added)</option>
                </select>
                <button
                  className="btn btn-secondary"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0 16px", height: "42px", fontSize: 12,
                    background: voice === "user_voice" ? "rgba(6,182,212,0.2)" : undefined,
                    borderColor: voice === "user_voice" ? "var(--accent-cyan)" : undefined,
                  }}
                  onClick={() => {
                    setVoice("user_voice");
                    alert("🎤 Voice feature: In a real app, this would open a recording/upload modal. Voice added successfully!");
                  }}
                >
                  🎤 Add your voice
                </button>
              </div>
            </div>

            {/* Genre */}
            <div className="form-field">
              <label className="form-label">Genre</label>
              <select
                className="form-select"
                value={genre}
                onChange={e => setGenre(e.target.value)}
              >
                <option value="">Select genre...</option>
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Tempo */}
            <div className="form-field">
              <label className="form-label">Tempo / Energy</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Slow", "Medium", "Fast", "Very Fast"].map(t => (
                  <button
                    key={t}
                    className="btn btn-secondary"
                    style={{
                      flex: 1, padding: "8px 4px", fontSize: 12,
                      background: tempo === t ? "rgba(6,182,212,0.2)" : undefined,
                      borderColor: tempo === t ? "rgba(6,182,212,0.5)" : undefined,
                      color: tempo === t ? "var(--accent-cyan)" : undefined,
                    }}
                    onClick={() => setTempo(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Lyrics */}
            <div className="form-field form-full">
              <label className="form-label">
                Lyrics / Song Concept *
                <span style={{ marginLeft: 8, color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  (min. 10 characters)
                </span>
              </label>
              <textarea
                className="form-textarea"
                placeholder={`Paste your lyrics or describe the song concept...\n\nExample:\nVerse 1:\nWalking through the midnight air\nStars are painting what we share\n\nChorus:\nWe are the dreamers of today...`}
                value={lyrics}
                onChange={e => setLyrics(e.target.value)}
                style={{ minHeight: 160 }}
              />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
                {lyrics.length} characters
              </div>
            </div>

            {/* Submit */}
            <div className="form-full" style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={!isFormValid || generating}
                style={{
                  padding: "14px 36px", fontSize: 16,
                  opacity: !isFormValid ? 0.5 : 1,
                  cursor: !isFormValid ? "not-allowed" : "pointer",
                }}
              >
                {generating ? "✨ Generating..." : "✨ Generate My Song"}
              </button>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {generating && (
          <div style={{ marginTop: 28, animation: "fadeInUp 0.4s ease" }}>
            <div className="progress-bar-container">
              <div className="progress-label">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{GENERATION_STEPS[Math.min(genStep, GENERATION_STEPS.length - 1)].icon}</span>
                  <span>{GENERATION_STEPS[Math.min(genStep, GENERATION_STEPS.length - 1)].label}</span>
                </span>
                <span>{Math.round((genStep / (GENERATION_STEPS.length - 1)) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(genStep / (GENERATION_STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {GENERATION_STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    borderRadius: 99,
                    background: i <= genStep ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i <= genStep ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.07)"}`,
                    fontSize: 12,
                    color: i <= genStep ? "var(--accent-cyan)" : "var(--text-muted)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span>{step.icon}</span>
                  <span style={{ fontWeight: 500 }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Song */}
        {generatedSong && (
          <div className="generated-song">
            <div className="generated-song-header">
              <div className="generated-song-art">🤖</div>
              <div>
                <div className="generated-song-tag">✅ AI Generated — Ready to Play</div>
                <div className="generated-song-title">{generatedSong.title}</div>
                <div className="generated-song-meta">
                  {generatedSong.meta.voice} Voice · {generatedSong.genre} · {generatedSong.meta.tempo}
                </div>
              </div>
            </div>

            {/* Lyrics preview */}
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 12,
              padding: "14px 16px", marginBottom: 16,
              borderLeft: "3px solid var(--accent-cyan)",
              maxHeight: 120, overflowY: "auto",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-cyan)", marginBottom: 8, letterSpacing: 1 }}>
                YOUR LYRICS
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {lyrics}
              </p>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10, marginBottom: 20,
            }}>
              {[
                { label: "Theme", value: generatedSong.meta.theme || "Custom" },
                { label: "Voice", value: generatedSong.meta.voice },
                { label: "Genre", value: generatedSong.genre },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 10,
                  padding: "12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => onAddGenerated && onAddGenerated(generatedSong)}>
                ▶ Play Song
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                ✨ Create Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      {!generating && !generatedSong && (
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>⚡ How It Works</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { step: "01", icon: "📝", title: "Provide Input", desc: "Give the AI your song theme, preferred voice type, and your lyrics or concept." },
              { step: "02", icon: "🧠", title: "AI Composes", desc: "Our AI analyzes your input and generates a melody, harmony, and vocal track in seconds." },
              { step: "03", icon: "🎵", title: "Your Song is Born", desc: "A unique, AI-crafted song is ready to play, download, and add to your library." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="glass-card" style={{ padding: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  color: "var(--accent-cyan)", marginBottom: 12,
                }}>
                  STEP {step}
                </div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
