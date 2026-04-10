import React, { useState, useEffect, useRef } from "react";
import { formatDuration } from "../data/songs";

export default function Player({ currentSong, isPlaying, setIsPlaying, onNext, onPrev, onLike, isLiked, isShuffled, onToggleShuffle }) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0=off 1=all 2=one
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const durationRef = useRef(currentSong?.duration || 200);

  // Reset progress when song changes
  useEffect(() => {
    setProgress(0);
    durationRef.current = currentSong?.duration || 200;
  }, [currentSong?.id]);

  // Handle Play/Pause for Audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Small delay to let audio element load new src
        const timer = setTimeout(() => {
          audioRef.current?.play().catch(e => console.log("Audio play error:", e));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Sync Progress for both Real and Simulated Audio
  useEffect(() => {
    if (!currentSong) return;
    
    durationRef.current = currentSong.duration || 200;

    if (isPlaying) {
      if (!currentSong.previewUrl) {
        // Simulation for sample data
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + 1;
            if (next >= durationRef.current) {
              clearInterval(intervalRef.current);
              onNext();
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentSong, onNext]);

  // Handle Real Audio Time Update
  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong?.previewUrl) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentSong?.previewUrl) {
      durationRef.current = audioRef.current.duration;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 2) { // Repeat one
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext();
    }
  };

  // Seek
  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current && currentSong?.previewUrl) {
      audioRef.current.currentTime = val;
    }
  };

  // Volume
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val / 100;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [isMuted, volume]);

  const toggleMute = () => setIsMuted((m) => !m);

  if (!currentSong) {
    return (
      <footer className="player" style={{ justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          🎵 Select a song to start playing
        </div>
      </footer>
    );
  }

  const duration = currentSong.previewUrl ? durationRef.current : (currentSong.duration || 200);
  const progressPct = Math.round((progress / duration) * 100);

  return (
    <footer className="player">
      {/* Hidden Audio Element */}
      {currentSong.previewUrl && (
        <audio
          ref={audioRef}
          src={currentSong.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

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
          <div className="player-track-name">{currentSong.title}</div>
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
