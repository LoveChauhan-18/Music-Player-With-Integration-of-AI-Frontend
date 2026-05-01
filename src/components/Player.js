import React, { useState, useEffect, useRef } from "react";
import { formatDuration } from "../data/songs";

export default function Player({ currentSong, isPlaying, setIsPlaying, onNext, onPrev, onLike, isLiked, isShuffled, onToggleShuffle }) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0=off 1=all 2=one
  const [duration, setDuration] = useState(currentSong?.duration || 200);

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const canPlayListenerRef = useRef(null);

  // ─── Effect 1: Reset progress when the SONG changes (id changes) ───────────
  useEffect(() => {
    setProgress(0);
    setDuration(currentSong?.duration || 200);

    // Clean up any previous canplay listener
    if (audioRef.current && canPlayListenerRef.current) {
      audioRef.current.removeEventListener('canplay', canPlayListenerRef.current);
      canPlayListenerRef.current = null;
    }
  }, [currentSong?.id]);

  // ─── Effect 2: Handle audio URL changes (preview → full audio swap) ─────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.previewUrl) return;

    // Remove any existing pending canplay listener
    if (canPlayListenerRef.current) {
      audio.removeEventListener('canplay', canPlayListenerRef.current);
      canPlayListenerRef.current = null;
    }

    // Set the new source and reload
    audio.src = currentSong.previewUrl;
    audio.load();

    if (isPlaying) {
      // Wait for the browser to have enough data before playing
      const onCanPlay = () => {
        audio.play().catch(e => console.log("Play after URL change:", e));
        audio.removeEventListener('canplay', onCanPlay);
        canPlayListenerRef.current = null;
      };
      canPlayListenerRef.current = onCanPlay;
      audio.addEventListener('canplay', onCanPlay);
    }
  }, [currentSong?.previewUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Effect 3: Handle play/pause toggling ───────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.previewUrl) return;

    if (isPlaying) {
      // If audio is already loaded and ready, play immediately
      if (audio.readyState >= 2) {
        audio.play().catch(e => console.log("Play/pause effect error:", e));
      }
      // Otherwise Effect 2's canplay listener will handle it
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong?.previewUrl]);

  // ─── Effect 4: Simulated progress for songs without real audio ──────────────
  useEffect(() => {
    if (!currentSong) return;
    setDuration(currentSong.duration || 200);

    if (isPlaying && !currentSong.previewUrl) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= (currentSong.duration || 200)) {
            clearInterval(intervalRef.current);
            onNext();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentSong, onNext]);

  // ─── Effect 5: Volume / Mute sync ───────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [isMuted, volume]);

  // ─── Audio event handlers ───────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong?.previewUrl) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentSong?.previewUrl) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = (e) => {
    console.error("Audio playback error:", e);
    if (currentSong?.isFullAudio) {
      console.warn(`Full audio for "${currentSong.title}" could not be loaded.`);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 2) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext();
    }
  };

  // ─── Seek ───────────────────────────────────────────────────────────────────
  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current && currentSong?.previewUrl) {
      audioRef.current.currentTime = val;
    }
  };

  // ─── Volume ──────────────────────────────────────────────────────────────────
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val / 100;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  // ─── No song selected ────────────────────────────────────────────────────────
  if (!currentSong) {
    return (
      <footer className="player" style={{ justifyContent: "center" }}>
        {/* Always mount audio element so ref is always valid */}
        <audio ref={audioRef} />
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          🎵 Select a song to start playing
        </div>
      </footer>
    );
  }

  const progressPct = Math.round((progress / (duration || 1)) * 100);

  return (
    <footer className="player" style={{ "--player-color": currentSong.color || "var(--accent-purple)" }}>
      <div className="player-ambient-glow" style={{ opacity: isPlaying ? 0.2 : 0.05 }} />

      {/* Always-mounted Audio Element — src managed imperatively via useEffect */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Now Playing Info */}
      <div className="player-info">
        {currentSong.artwork ? (
          <img src={currentSong.artwork} alt="" className={`player-art ${isPlaying ? 'spinning' : ''}`} />
        ) : (
          <div className="player-art-placeholder" style={{
            background: `linear-gradient(135deg, ${currentSong.color || "var(--accent-purple)"}88, ${currentSong.color || "var(--accent-purple)"}33)`,
            fontSize: 22,
          }}>
            {currentSong.emoji || "🎵"}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="player-track-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {currentSong.title}
            {currentSong.isFullAudio && (
              <span className="badge-hq animate-fade-in" title="Playing High Quality Full Audio">HQ</span>
            )}
            {currentSong.isLoading && (
              <span style={{ fontSize: 10, color: "var(--accent-purple)", animation: "pulse 2s infinite" }}>
                ⌛ Resolving Full Audio...
              </span>
            )}
          </div>
          <div className="player-artist-name">
            {typeof currentSong.artist === 'object' ? currentSong.artist.name : currentSong.artist}
            {!currentSong.isFullAudio && !currentSong.isLoading && currentSong.source === "itunes" && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8 }}>
                (30s Preview)
              </span>
            )}
          </div>
        </div>
        <button
          className={`player-like-btn ${isLiked ? "liked" : ""}`}
          onClick={() => onLike(currentSong.id)}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="player-buttons" style={{ position: "relative" }}>
          {/* Left Dancers */}
          {isPlaying && (
            <div className="ai-dancers" style={{ position: "absolute", left: "-80px", fontSize: "24px", pointerEvents: "none", display: "flex", gap: "10px" }}>
              <div style={{ animation: "dance3 1s infinite alternate" }}>👯</div>
              <div style={{ animation: "dance1 1.2s infinite alternate" }}>🕺</div>
            </div>
          )}

          <button 
            className={`player-control-btn ${isShuffled ? "active" : ""}`} 

            onClick={onToggleShuffle}
            title="Shuffle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>
          
          <button className="player-control-btn" onClick={onPrev} title="Previous">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line>
            </svg>
          </button>

          <button className="btn-play" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button className="player-control-btn" onClick={onNext} title="Next">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line>
            </svg>
          </button>

          <button 
            className={`player-control-btn ${repeatMode !== 0 ? "active" : ""}`} 
            onClick={() => setRepeatMode((repeatMode + 1) % 3)}
            title="Repeat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              {repeatMode === 2 && <text x="9" y="15" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">1</text>}
            </svg>
          </button>

          {/* Right Dancers */}
          {isPlaying && (
            <div className="ai-dancers" style={{ position: "absolute", right: "-80px", fontSize: "24px", pointerEvents: "none", display: "flex", gap: "10px" }}>
              <div style={{ animation: "dance2 1s infinite alternate" }}>💃</div>
              <div style={{ animation: "dance3 1.1s infinite alternate" }}>👯</div>
            </div>
          )}
        </div>

        <div className="player-progress">
          <span className="player-time">{formatDuration(Math.floor(progress))}</span>
          <div className="player-progress-bar">
            <input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleSeek}
              style={{ "--progress": `${progressPct}%` }}
            />
          </div>
          <span className="player-time">{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="player-right">
         {isPlaying && (
          <div className="wave-bars">
            <span /><span /><span /><span />
          </div>
        )}
        <div className="player-volume">
          <button className="player-volume-icon" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ "--progress": `${isMuted ? 0 : volume}%` }}
          />
        </div>
      </div>
    </footer>
  );
}
