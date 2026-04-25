import React, { useState } from "react";
import { SONGS, MOODS, AI_MOOD_RESPONSES, formatDuration } from "../data/songs";
import { searchMusic, fetchGlobalMoodSongs } from "../services/musicApi";

function MoodSongCard({ song, onPlay, isPlaying, isCurrentSong, moodColor }) {
  return (
    <div
      className={`song-card animate-fade-in ${isCurrentSong ? "playing" : ""}`}
      onClick={() => onPlay(song)}
      style={{ cursor: "pointer" }}
    >
      <div className="song-card-art">
        {song.artwork ? (
          <img src={song.artwork} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="song-card-art-placeholder" style={{
            background: `linear-gradient(135deg, ${song.color || moodColor || '#8b5cf6'}55, ${song.color || moodColor || '#8b5cf6'}22)`,
          }}>
            <span style={{ fontSize: 48 }}>{song.emoji || '🎵'}</span>
          </div>
        )}
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

export default function MoodAIPage({ currentSong, isPlaying, onPlay, allSongs = [] }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moodSongs, setMoodSongs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);

  const combinedLibrary = [...allSongs, ...SONGS];
  // Dedupe
  const songMap = new Map(combinedLibrary.map(s => [s.id, s]));
  const fullLibrary = Array.from(songMap.values());

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.id);
    setIsThinking(true);
    setAiResponse(null);
    setMoodSongs([]);
    setVisibleCount(20);

    try {
      // 1. Filter local library
      const localMatches = fullLibrary.filter((s) => 
        s.mood?.includes(mood.id) || 
        s.genre?.toLowerCase().includes(mood.id) ||
        (mood.id === 'happy' && (s.genre?.toLowerCase().includes('pop') || s.genre?.toLowerCase().includes('dance'))) ||
        (mood.id === 'sad' && (s.genre?.toLowerCase().includes('ambient') || s.genre?.toLowerCase().includes('acoustic'))) ||
        (mood.id === 'energetic' && (s.genre?.toLowerCase().includes('rock') || s.genre?.toLowerCase().includes('hip-hop')))
      );

      // 2. Multi-regional Global Sync (Bollywood, Hollywood, K-Pop, J-Pop)
      const globalMatches = await fetchGlobalMoodSongs(mood.label, 50);

      // 3. Merge and dedupe
      const allMatched = dedupe([...localMatches, ...globalMatches]);
      
      setTimeout(() => {
        setMoodSongs(allMatched);
        const songListText = allMatched.slice(0, 3).map(s => `"${s.title}"`).join(", ");
        setAiResponse(`${AI_MOOD_RESPONSES[mood.id]} I've curated ${allMatched.length} multi-cultural songs across Bollywood, Hollywood, K-Pop, and J-Pop for you, starting with ${songListText}.`);
        setIsThinking(false);
      }, 1000);
    } catch (e) {
      console.error("Mood selection sync error:", e);
      setIsThinking(false);
    }
  };

  const handlePromptSubmit = async () => {
    if (!customPrompt.trim()) return;
    setIsThinking(true);
    setSelectedMood(null);
    setAiResponse(null);
    setMoodSongs([]);
    setVisibleCount(20);

    const lower = customPrompt.toLowerCase();
    
    // 1. Try keyword matching in the ENTIRE library
    let matches = fullLibrary.filter(s => {
      const text = `${s.title} ${s.artist} ${s.genre} ${s.mood?.join(' ') || ''}`.toLowerCase();
      return lower.split(' ').some(word => word.length > 3 && text.includes(word));
    });

    // 2. Fetch high-volume results from ALL global regions
    try {
      // Use fetchGlobalMoodSongs to get Bollywood, Hollywood, K-Pop, and J-Pop hits for this description
      const globalMatches = await fetchGlobalMoodSongs(customPrompt, 50);
      
      let extraMatches = [];
      if (customPrompt.split(' ').length < 3) {
        // For short prompts, search for trending hits in that category
        extraMatches = await fetchGlobalMoodSongs(`${customPrompt} hits 2024`, 25);
      }
      
      matches = dedupe([...matches, ...globalMatches, ...extraMatches]);
    } catch (e) {
      console.error("Global mood search failed", e);
    }

    // 3. Match predefined mood for AI response text
    const matchedMood = MOODS.find(m =>
      lower.includes(m.id) || lower.includes(m.label.toLowerCase())
    );

    setTimeout(() => {
      const finalSongs = matches; // No limit - show everything found
      setMoodSongs(finalSongs);
      
      const songListText = finalSongs.slice(0, 3).map(s => `"${s.title}"`).join(", ");
      
      if (matchedMood) {
        setAiResponse(`${AI_MOOD_RESPONSES[matchedMood.id]} I've scanned the app and discovered ${finalSongs.length} songs like ${songListText} for you.`);
        setSelectedMood(matchedMood.id);
      } else {
        setAiResponse(
          `🎵 I've analyzed your vibe: "${customPrompt}". I've gathered ${finalSongs.length} songs like ${songListText} that resonate with that feeling. ✨`
        );
      }
      setIsThinking(false);
    }, 1500);
  };

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(s => {
      const id = s.id || `${s.title}-${s.artist}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const activeMood = MOODS.find(m => m.id === selectedMood);

  return (
    <div className="page mood-theme-page" style={{ 
      "--mood-color": activeMood?.color || "var(--accent-purple)",
      "--mood-color-rgb": activeMood ? hexToRgb(activeMood.color) : "139, 92, 246"
    }}>
      {/* Dynamic Background Glows */}
      <div className="mood-bg-glow glow-1"></div>
      <div className="mood-bg-glow glow-2"></div>

      <div className="ai-panel glass">
        {/* Header */}
        <div className="ai-panel-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="ai-badge">🤖 AI Mood Discovery</span>
            </div>
            <h2 className="ai-panel-title">How are you feeling?</h2>
            <p className="ai-panel-sub">
              Describe your vibe or pick a mood, and I'll find individual songs for you.
            </p>
          </div>
          <div className="mood-orb-container">
             <div className="mood-orb"></div>
             <div className="mood-orb-emoji">{activeMood?.emoji || "🧠"}</div>
          </div>
        </div>

        {/* Mood Selector Grid */}
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
          <div className="ai-prompt-label">Describe your mood in your own words</div>
          <div style={{ position: "relative" }}>
            <textarea
              className="ai-prompt-input"
              placeholder="e.g. 'Walking through a neon city at night' or 'Deep focus for coding'..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
            />
            <button 
              className="btn btn-primary mood-themed-btn" 
              onClick={handlePromptSubmit} 
              disabled={!customPrompt.trim() || isThinking}
              style={{ position: "absolute", bottom: 12, right: 12 }}
            >
              {isThinking ? "Analyzing..." : "✨ Find Songs"}
            </button>
          </div>
        </div>

        {/* AI Thinking State */}
        {isThinking && (
          <div className="ai-recommendation animate-pulse mood-themed-rec">
            <div className="ai-rec-header">
              <span>🤖 AI is feeling your vibe...</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Searching for songs that match your frequency...
            </p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !isThinking && (
          <div className="ai-recommendation animate-fade-in mood-themed-rec">
            <div className="ai-rec-header">
              <span>🤖 NeuraBeats AI</span>
              {activeMood && (
                <span className="active-mood-badge">
                  {activeMood.emoji} {activeMood.label} Mode
                </span>
              )}
            </div>
            <p className="ai-response-text">
              {aiResponse}
            </p>
          </div>
        )}
      </div>

      {/* Song Recommendations */}
      {moodSongs.length > 0 && !isThinking && (
        <div className="mood-results-container">
          <div className="section-header">
            <h2 className="section-title mood-themed-title">
              {activeMood?.emoji || "✨"} Songs for your {activeMood?.label || "current"} mood
              <span className="match-count">
                {moodSongs.length} matches
              </span>
            </h2>
          </div>
          <div className="songs-grid">
            {moodSongs.slice(0, visibleCount).map((song) => (
              <MoodSongCard
                key={song.id || `${song.title}-${song.artist}`}
                song={song}
                onPlay={(s) => onPlay(s, moodSongs)}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                moodColor={activeMood?.color}
              />
            ))}
          </div>

          {visibleCount < moodSongs.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '60px' }}>
              <button 
                className="btn-outline" 
                onClick={() => setVisibleCount(prev => prev + 20)}
                style={{ 
                  padding: '12px 32px', 
                  borderRadius: '99px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeMood?.color || 'var(--accent-purple)'}44`,
                  color: activeMood?.color || 'var(--accent-purple)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Load More Songs ({moodSongs.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedMood && moodSongs.length === 0 && !isThinking && (
        <div className="empty-state mood-empty-state">
          <span className="empty-state-icon">🎭</span>
          <h3>Your Mood, Your Music</h3>
          <p>Describe how you feel or pick a mood, and I'll find individual songs for you.</p>
        </div>
      )}
    </div>
  );
}

// Helper to convert Hex to RGB for CSS rgba
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    "139, 92, 246";
}
