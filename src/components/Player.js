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
          </div>
          <div className="player-artist-name">{currentSong.artist}</div>
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
        <div className="player-buttons">
          <button className={`player-control-btn ${isShuffled ? "active" : ""}`} onClick={onToggleShuffle}>🔀</button>
          <button className="player-control-btn" onClick={onPrev}>⏮️</button>
          <button className="btn-play" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="player-control-btn" onClick={onNext}>⏭️</button>
          <button className={`player-control-btn ${repeatMode !== 0 ? "active" : ""}`} onClick={() => setRepeatMode((repeatMode + 1) % 3)}>
             {repeatMode === 2 ? "🔂" : "🔁"}
          </button>
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
            {isMuted || volume === 0 ? "🔇" : "🔊"}
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
