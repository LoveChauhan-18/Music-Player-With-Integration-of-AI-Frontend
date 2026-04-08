import React, { useState, useEffect } from "react";
import { SONGS, formatDuration, formatPlays } from "../data/songs";
import { fetchLatestGlobal } from "../services/musicApi";

function SongRow({ song, index, isPlaying, isCurrentSong, onPlay, onLike, isLiked }) {
  return (
    <div
      className={`song-row ${isCurrentSong ? "playing" : ""}`}
      onClick={() => onPlay(song)}
    >
      <div className="song-row-num">
        {isCurrentSong && isPlaying ? (
          <div className="wave-bars" style={{ justifyContent: "center" }}>
            <span /><span /><span /><span />
          </div>
        ) : (
          index + 1
        )}
      </div>
      <div className="song-row-info">
        {song.artwork ? (
          <img src={song.artwork} alt="" className="song-row-thumb" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} />
        ) : (
          <div className="song-row-thumb-placeholder" style={{
            background: `linear-gradient(135deg, ${song.color || '#333'}88, ${song.color || '#333'}33)`,
          }}>
            {song.emoji || '🎵'}
          </div>
        )}
        <div>
          <div className="song-row-name">{song.title}</div>
          <div className="song-row-artist">{song.artist}</div>
        </div>
      </div>
      <div className="song-row-album">{song.album}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
        <button
          className={`player-like-btn ${isLiked ? "liked" : ""}`}
          onClick={(e) => { e.stopPropagation(); onLike(song.id); }}
          style={{ opacity: isLiked ? 1 : 0.3, transition: "opacity 0.2s" }}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <span className="song-row-duration">{formatDuration(song.duration)}</span>
      </div>
    </div>
  );
}

export default function HomePage({ currentSong, isPlaying, onPlay, onLike, likedSongs, setActivePage }) {
  const [latestSongs, setLatestSongs] = useState([]);
  const [localLib, setLocalLib] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoadingLatest(true);
      const { fetchLatestGlobal, fetchLocalLibrary } = await import("../services/musicApi");
      const [latest, lib] = await Promise.all([
        fetchLatestGlobal(),
        fetchLocalLibrary()
      ]);
      setLatestSongs(latest);
      setLocalLib(lib);
      setLoadingLatest(false);
    }
    loadData();
  }, []);

  const trending = [...localLib].sort((a, b) => b.plays - a.plays).slice(0, 6);
  const recent = [...localLib].slice(-8).reverse();

  return (
    <div className="page">
      <div className="hero-banner">
        <div className="hero-tag">✨ AI-Powered Music Experience</div>
        <h1 className="hero-title">
          Music That Understands <span className="gradient-text">Your Mood</span>
        </h1>
        <p className="hero-sub">
          Let our AI curate the perfect playlist, or create entirely new songs tailored just for you.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setActivePage("mood")}>
            🧠 Try AI Mood
          </button>
          <button className="btn btn-secondary" onClick={() => setActivePage("creator")}>
            ✨ Create a Song
          </button>
        </div>
      </div>

      {/* Fresh Drops (Latest API) */}
      <div className="section-header" style={{ marginTop: 32 }}>
        <h2 className="section-title">🔥 Fresh Off The Press</h2>
        <span className="hero-tag" style={{ fontSize: 10, padding: "2px 8px" }}>Global Hits</span>
      </div>

      {loadingLatest ? (
        <div className="songs-grid" style={{ marginBottom: 40 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="song-card" style={{ opacity: 0.5 }}>
              <div className="song-card-art skeleton" />
              <div className="skeleton" style={{ height: 16, width: "70%", marginTop: 12 }} />
              <div className="skeleton" style={{ height: 12, width: "50%", marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="songs-grid" style={{ marginBottom: 40 }}>
          {latestSongs.map((song) => (
            <div
              key={song.id}
              className={`song-card ${currentSong?.id === song.id ? "playing" : ""}`}
              onClick={() => onPlay(song)}
            >
              <div className="song-card-art">
                {song.artwork ? (
                  <img src={song.artwork} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div className="song-card-art-placeholder" style={{ background: (song.color || '#8b5cf6') + "44" }}>{song.emoji || '🎵'}</div>
                )}
                
                {/* Like Button */}
                <button
                  className={`song-card-like ${likedSongs.includes(song.id) ? "liked" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onLike(song.id); }}
                >
                  {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                </button>

                <div className="song-card-play-overlay">
                  <button className="btn-play btn-play-sm">
                    {currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}
                  </button>
                </div>
              </div>
              <div className="song-card-title">{song.title}</div>
              <div className="song-card-artist">{song.artist}</div>
            </div>
          ))}
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value gradient-text">{localLib.length}</div>
          <div className="stat-label">🎵 Songs Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value gradient-text-cyan">{likedSongs.length}</div>
          <div className="stat-label">❤️ Songs Liked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            2
          </div>
          <div className="stat-label">🤖 AI Features</div>
        </div>
      </div>

      {/* Trending */}
      <div className="section-header">
        <h2 className="section-title">🔥 Trending Now</h2>
        <button className="section-link" onClick={() => setActivePage("library")}>See all</button>
      </div>
      <div className="songs-grid" style={{ marginBottom: 40 }}>
        {trending.map((song) => (
          <div
            key={song.id}
            className={`song-card ${currentSong?.id === song.id ? "playing" : ""}`}
            onClick={() => onPlay(song)}
          >
            <div className="song-card-art">
              <div className="song-card-art-placeholder" style={{
                background: `linear-gradient(135deg, ${song.color}55, ${song.color}22)`,
              }}>
                <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>
                  {song.emoji}
                </span>
              </div>

              {/* Like Button */}
              <button
                className={`song-card-like ${likedSongs.includes(song.id) ? "liked" : ""}`}
                onClick={(e) => { e.stopPropagation(); onLike(song.id); }}
              >
                {likedSongs.includes(song.id) ? "❤️" : "🤍"}
              </button>

              <div className="song-card-play-overlay">
                <button className="btn-play btn-play-sm">
                  {currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}
                </button>
              </div>
              {currentSong?.id === song.id && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(0,0,0,0.6)", borderRadius: 99,
                  padding: "2px 8px",
                }}>
                  <div className="wave-bars" style={{ height: 14 }}>
                    <span/><span/><span/><span/>
                  </div>
                </div>
              )}
            </div>
            <div className="song-card-title">{song.title}</div>
            <div className="song-card-artist">{song.artist} · {formatPlays(song.plays)}</div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="section-header">
        <h2 className="section-title">🕐 Recently Added</h2>
      </div>
      <div className="song-row" style={{ cursor: "default", opacity: 0.5, marginBottom: 4 }}>
        <div className="song-row-num">#</div>
        <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
        <div className="song-row-album" style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Album</div>
        <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
      <div className="song-list">
        {recent.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            index={i}
            isPlaying={isPlaying}
            isCurrentSong={currentSong?.id === song.id}
            onPlay={onPlay}
            onLike={onLike}
            isLiked={likedSongs.includes(song.id)}
          />
        ))}
      </div>
    </div>
  );
}
