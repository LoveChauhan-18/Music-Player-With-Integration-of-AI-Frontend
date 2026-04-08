import React, { useState } from "react";
import { SONGS, MOODS, AI_MOOD_RESPONSES, formatDuration } from "../data/songs";

function MoodSongCard({ song, onPlay, isPlaying, isCurrentSong, moodColor }) {
  return (
    <div
      className={`song-card ${isCurrentSong ? "playing" : ""}`}
      onClick={() => onPlay(song)}
      style={{ cursor: "pointer" }}
    >
      <div className="song-card-art">
        <div className="song-card-art-placeholder" style={{
          background: `linear-gradient(135deg, ${song.color}55, ${song.color}22)`,
        }}>
          <span style={{ fontSize: 48 }}>{song.emoji}</span>
        </div>
        <div className="song-card-play-overlay">
          <button className="btn-play btn-play-sm">
            {isCurrentSong && isPlaying ? "⏸" : "▶"}
          </button>
        </div>
        {isCurrentSong && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,0,0,0.6)", borderRadius: 99, padding: "2px 8px"
          }}>
            <div className="wave-bars" style={{ height: 14 }}>
              <span/><span/><span/><span/>
            </div>
          </div>
        )}
      </div>
      <div className="song-card-title">{song.title}</div>
      <div className="song-card-artist">{song.artist} · {formatDuration(song.duration)}</div>
    </div>
  );
}

export default function MoodAIPage({ currentSong, isPlaying, onPlay }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moodSongs, setMoodSongs] = useState([]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setIsThinking(true);
    setAiResponse(null);
    setMoodSongs([]);

    // Simulate AI thinking
    setTimeout(() => {
      const filtered = SONGS.filter((s) => s.mood.includes(mood.id));
      setMoodSongs(filtered.length > 0 ? filtered : SONGS.slice(0, 4));
      setAiResponse(AI_MOOD_RESPONSES[mood.id]);
      setIsThinking(false);
    }, 1800);
  };

  const handlePromptSubmit = () => {
    if (!customPrompt.trim()) return;
    setIsThinking(true);
    setAiResponse(null);
    setMoodSongs([]);
    const lower = customPrompt.toLowerCase();
    const matchedMood = MOODS.find(m =>
      lower.includes(m.id) || lower.includes(m.label.toLowerCase())
    );

    setTimeout(() => {
      if (matchedMood) {
        const filtered = SONGS.filter(s => s.mood.includes(matchedMood.id));
        setMoodSongs(filtered);
        setAiResponse(AI_MOOD_RESPONSES[matchedMood.id]);
        setSelectedMood(matchedMood.id);
      } else {
        setMoodSongs(SONGS.slice(0, 6));
        setAiResponse(
          `🎵 Based on your description "${customPrompt}", I've curated a diverse mix of tracks that best match your current vibe. Enjoy! ✨`
        );
      }
      setIsThinking(false);
    }, 2000);
  };

  const activeMood = MOODS.find(m => m.id === selectedMood);

  return (
    <div className="page">
      <div className="ai-panel">
        {/* Header */}
        <div className="ai-panel-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="ai-badge">🤖 AI Agent</span>
            </div>
            <h2 className="ai-panel-title">Mood-Based Music Discovery</h2>
            <p className="ai-panel-sub">
              Tell me how you're feeling and I'll curate the perfect playlist for you.
            </p>
          </div>
          <div style={{ fontSize: 64, lineHeight: 1, animation: "float 3s ease infinite" }}>
            🧠
          </div>
        </div>

        {/* Mood Selector Grid */}
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
          How are you feeling?
        </h3>
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              className={`mood-btn mood-${mood.id} ${selectedMood === mood.id ? "selected" : ""}`}
              style={{ "--mood-color": mood.color }}
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="mood-btn-emoji">{mood.emoji}</span>
              <span className="mood-btn-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Prompt */}
        <div className="ai-prompt-area">
          <div className="ai-prompt-label">Or describe your mood in your own words</div>
          <textarea
            className="ai-prompt-input"
            placeholder="e.g. 'I just finished a long day and want something relaxing...' or 'I'm pumped up for my workout!'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePromptSubmit();
              }
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handlePromptSubmit} disabled={!customPrompt.trim()}>
              ✨ Analyze Mood
            </button>
          </div>
        </div>

        {/* AI Thinking State */}
        {isThinking && (
          <div className="ai-recommendation">
            <div className="ai-rec-header">
              <span>🤖 AI is analyzing your mood</span>
              <div className="ai-typing">
                <span/><span/><span/>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Scanning music library... Finding perfect tracks... Curating your playlist...
            </p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !isThinking && (
          <div className="ai-recommendation" style={{
            borderColor: activeMood ? `${activeMood.color}44` : "rgba(139,92,246,0.15)",
          }}>
            <div className="ai-rec-header">
              <span>🤖 NeuraBeats AI</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px",
                background: activeMood ? `${activeMood.color}22` : "rgba(139,92,246,0.15)",
                borderRadius: 99,
                color: activeMood?.color || "var(--accent-purple)",
              }}>
                {activeMood?.emoji} {activeMood?.label || "Custom"} Mode
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
              {aiResponse}
            </p>
          </div>
        )}
      </div>

      {/* Song Recommendations */}
      {moodSongs.length > 0 && !isThinking && (
        <div style={{ marginTop: 32, animation: "fadeInUp 0.5s ease forwards" }}>
          <div className="section-header">
            <h2 className="section-title">
              {activeMood?.emoji} {activeMood?.label || "Custom"} Playlist
              <span style={{
                fontSize: 14, fontWeight: 400,
                color: "var(--text-muted)", marginLeft: 12,
              }}>
                {moodSongs.length} songs
              </span>
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => moodSongs.length > 0 && onPlay(moodSongs[0])}
            >
              ▶ Play All
            </button>
          </div>
          <div className="songs-grid">
            {moodSongs.map((song) => (
              <MoodSongCard
                key={song.id}
                song={song}
                onPlay={onPlay}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                moodColor={activeMood?.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedMood && moodSongs.length === 0 && !isThinking && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <span className="empty-state-icon">🎭</span>
          <h3>Your mood, your music</h3>
          <p>Select a mood above or describe how you're feeling to get a personalized playlist crafted by AI.</p>
        </div>
      )}
    </div>
  );
}
