import React, { useState, useEffect } from "react";
import { VOICE_TYPES, GENRES } from "../data/songs";
import { fetchAIVoices, generateAIVocal } from "../services/musicApi";

const SONG_THEMES = [
  "Love & Romance", "Heartbreak", "Adventure", "Party Night", "Self-Discovery",
  "Nostalgia", "Hope & Resilience", "Celebration", "Nature & Peace", "Hustle & Grind",
  "Friendship", "Social Justice", "Fantasy", "Late Night Vibes", "Custom",
];

const SONG_LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese", "Korean", "Italian", "Chinese", "Arabic", "Portuguese", "Dutch", "Turkish", "Indonesian"
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
  const [language, setLanguage] = useState("English");
  const [tempo, setTempo] = useState("Medium");
  const [lyrics, setLyrics] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generatedSong, setGeneratedSong] = useState(null);
  
  // New States for ElevenLabs & Voice Upload
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [customVoiceAdded, setCustomVoiceAdded] = useState(false);

  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    async function loadVoices() {
      const voices = await fetchAIVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    }
    loadVoices();
  }, []);

  const isFormValid = (theme || customTheme) && voice && lyrics.trim().length > 10;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedAudioUrl(url);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedAudioUrl(null);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordAgain = () => {
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    startRecording();
  };

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setGenerating(true);
    setGeneratedSong(null);
    setGenStep(0);

    let step = 0;
    let finalAudioUrl = null;

    const interval = setInterval(async () => {
      step++;
      setGenStep(step);
      
      if (step === 2 && voice.startsWith("eleven_")) {
        try {
          const result = await generateAIVocal(lyrics.substring(0, 500), voice.replace("eleven_", ""));
          if (result && result.audio_url) {
            finalAudioUrl = result.audio_url;
          }
        } catch (e) {
          console.error("Real vocal generation failed, falling back to simulation", e);
        }
      }

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
            previewUrl: finalAudioUrl || (voice.startsWith("eleven_") ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" : null),
            meta: { theme: finalTheme, voice, genre, tempo, lyrics, language },
          };
          setGeneratedSong(generated);
          setGenerating(false);
          if (onAddGenerated) onAddGenerated(generated);
        }, 600);
      }
    }, 1200);
  };

  const handleReset = () => {
    setGeneratedSong(null);
    setTheme("");
    setCustomTheme("");
    setVoice("");
    setGenre("");
    setLanguage("English");
    setTempo("Medium");
    setLyrics("");
    setSongTitle("");
    setGenStep(0);
  };

  const handleVoiceUpload = (fileOrBlob) => {
    setIsUploadingVoice(true);
    setTimeout(() => {
      setIsUploadingVoice(false);
      setCustomVoiceAdded(true);
      setVoice("user_voice_cloned");
      setShowVoiceModal(false);
    }, 3000);
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
                  
                  <optgroup label="Premium ElevenLabs Voices">
                    {availableVoices.length > 0 ? (
                      availableVoices.map(v => (
                        <option key={v.voice_id} value={`eleven_${v.voice_id}`}>{v.name} ({v.category})</option>
                      ))
                    ) : (
                      VOICE_TYPES.filter(v => v.includes("ElevenLabs")).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))
                    )}
                  </optgroup>

                  <optgroup label="Standard Voices">
                    {VOICE_TYPES.filter(v => !v.includes("ElevenLabs")).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </optgroup>
                  
                  {customVoiceAdded && (
                    <option value="user_voice_cloned">👤 Your Cloned Voice (Ready)</option>
                  )}
                </select>
                <button
                  className="btn btn-secondary"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0 16px", height: "42px", fontSize: 12,
                    background: customVoiceAdded ? "rgba(6,182,212,0.2)" : undefined,
                    borderColor: customVoiceAdded ? "var(--accent-cyan)" : undefined,
                  }}
                  onClick={() => setShowVoiceModal(true)}
                >
                  {customVoiceAdded ? "🎤 Voice Added" : "🎤 Add your voice"}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="form-field">
              <label className="form-label">Song Language *</label>
              <select
                className="form-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {SONG_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
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
              <div className="progress-label" style={{ marginBottom: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{GENERATION_STEPS[Math.min(genStep, GENERATION_STEPS.length - 1)].icon}</span>
                  <span style={{ fontWeight: 600 }}>{GENERATION_STEPS[Math.min(genStep, GENERATION_STEPS.length - 1)].label}</span>
                </span>
                <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{Math.round((genStep / (GENERATION_STEPS.length - 1)) * 100)}%</span>
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
                    padding: "8px 16px",
                    borderRadius: 99,
                    background: i <= genStep ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i <= genStep ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.07)"}`,
                    fontSize: 12,
                    color: i <= genStep ? "var(--accent-cyan)" : "var(--text-muted)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span>{step.icon}</span>
                  <span style={{ fontWeight: 600 }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Song */}
        {generatedSong && (
          <div className="generated-song" style={{ animation: "fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div className="generated-song-header">
              <div className="generated-song-art" style={{ background: "var(--gradient-primary)", boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" }}>🤖</div>
              <div>
                <div className="generated-song-tag" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  ✨ AI Masterpiece Ready
                </div>
                <div className="generated-song-title">{generatedSong.title}</div>
                <div className="generated-song-meta">
                  {generatedSong.meta.voice.replace("eleven_", "")} Voice · {generatedSong.genre} · {generatedSong.meta.tempo}
                </div>
              </div>
            </div>

            {/* Lyrics preview */}
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 16,
              padding: "20px", marginBottom: 20,
              borderLeft: "4px solid var(--accent-cyan)",
              maxHeight: 150, overflowY: "auto",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-cyan)", marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" }}>
                Vocal Script
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                "{lyrics}"
              </p>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12, marginBottom: 24,
            }}>
              {[
                { label: "Vibe", value: generatedSong.meta.theme || "Custom" },
                { label: "Engine", value: voice.startsWith("eleven_") ? "ElevenLabs v2" : "NeuralCore v1" },
                { label: "Style", value: generatedSong.genre },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 14,
                  padding: "16px 12px", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 2, padding: "16px", fontSize: 16 }}
                onClick={() => onAddGenerated && onAddGenerated(generatedSong)}>
                ▶ Play AI Composition
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleReset}>
                🔄 New Song
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Upload Modal */}
      {showVoiceModal && (
        <div className="modal-overlay" onClick={() => !isUploadingVoice && setShowVoiceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🎤 Clone Your Voice</h3>
              <button className="modal-close" onClick={() => setShowVoiceModal(false)}>✕</button>
            </div>
            
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
              Upload a clear 1-minute audio sample of your voice. Our ElevenLabs engine will create a high-fidelity digital clone for your songs.
            </p>

            {!isUploadingVoice ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className={`upload-zone ${isRecording ? 'recording' : ''} ${recordedAudioUrl ? 'preview' : ''}`} 
                  onClick={() => !isRecording && !recordedAudioUrl && startRecording()}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {isRecording ? (
                    <>
                      <div className="recording-pulse"></div>
                      <span className="upload-icon" style={{ animation: 'pulse 1.5s infinite' }}>🎙️</span>
                      <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8, color: '#ef4444' }}>
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Recording your voice...</div>
                      <button 
                        className="btn btn-primary" 
                        style={{ marginTop: 20, background: '#ef4444', borderColor: '#ef4444' }}
                        onClick={(e) => { e.stopPropagation(); stopRecording(); }}
                      >
                        ⏹ Stop Recording
                      </button>
                    </>
                  ) : recordedAudioUrl ? (
                    <>
                      <span className="upload-icon">🔊</span>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recording Captured!</div>
                      
                      <audio src={recordedAudioUrl} controls style={{ width: '100%', marginBottom: 20, height: 32 }} />

                      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1 }}
                          onClick={() => handleVoiceUpload(recordedBlob)}
                        >
                          ✨ Use This Voice
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1 }}
                          onClick={handleRecordAgain}
                        >
                          🔄 Record Again
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📁</span>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Click to upload audio</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>WAV, MP3 or M4A (Max 10MB)</div>
                      
                      <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                      </div>

                      <button className="btn btn-primary" style={{ width: '100%', gap: 8 }} onClick={(e) => { e.stopPropagation(); startRecording(); }}>
                        🎙️ Start Live Recording
                      </button>
                    </>
                  )}
                </div>
                
                {!isRecording && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "rgba(6, 182, 212, 0.05)", borderRadius: 12, border: "1px solid rgba(6, 182, 212, 0.1)" }}>
                    <span style={{ fontSize: 20 }}>💡</span>
                    <p style={{ fontSize: 12, color: "var(--accent-cyan)", margin: 0 }}>
                      Tip: Speak clearly for about 30 seconds for the best AI clone quality.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div className="spinner" style={{ margin: "0 auto 20px" }}></div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Cloning Voice...</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Analyzing vocal patterns and harmonics</div>
                
                <div className="progress-bar-container" style={{ marginTop: 24 }}>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '65%', animation: 'none' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      {!generating && !generatedSong && (
        <div style={{ marginTop: 48, animation: "fadeInUp 0.6s ease" }}>
          <h3 className="section-title" style={{ marginBottom: 24, textAlign: "center", fontSize: 24 }}>✨ The AI Composition Engine</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { step: "01", icon: "📝", title: "Creative Input", desc: "Our LLM interprets your lyrics and theme to set the emotional foundation of the track." },
              { step: "02", icon: "🎤", title: "Vocal Synthesis", desc: "ElevenLabs generates life-like vocals with perfect pitch, tone, and emotional inflection." },
              { step: "03", icon: "🎹", title: "Neural Mastering", desc: "Advanced neural networks mix and master the final audio for a studio-quality finish." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="glass-card" style={{ padding: 32, textAlign: "center", position: "relative" }}>
                <div style={{
                  position: "absolute", top: 16, right: 20,
                  fontSize: 40, fontWeight: 900, opacity: 0.05,
                  fontFamily: 'Space Grotesk'
                }}>
                  {step}
                </div>
                <div style={{ fontSize: 44, marginBottom: 20 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "var(--text-primary)" }}>{title}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
