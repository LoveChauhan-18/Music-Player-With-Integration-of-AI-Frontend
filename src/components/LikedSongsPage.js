import React from "react";
import { SONGS, formatDuration } from "../data/songs";

export default function LikedSongsPage({ currentSong, isPlaying, onPlay, onLike, likedSongs, allSongs = [] }) {
  // Merge static SONGS with dynamic allSongs and filter by liked status
  const songMap = new Map([...SONGS, ...allSongs].map(s => [s.id, s]));
  const liked = Array.from(songMap.values()).filter(s => likedSongs.includes(s.id));

  return (
    <div className="page">
      {/* Playlist Hero */}
      <div className="playlist-hero">
        <div style={{
          width: 180, height: 180,
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72,
          boxShadow: "0 16px 48px rgba(244,63,94,0.3)",
          flexShrink: 0,
        }}>
          ❤️
        </div>
        <div className="playlist-hero-info">
          <div className="playlist-type-tag">Playlist</div>
          <h1 className="playlist-hero-title">Liked Songs</h1>
          <div className="playlist-hero-meta">
            {liked.length} songs
          </div>
          {liked.length > 0 && (
            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={() => liked.length > 0 && onPlay(liked[0])}>
                ▶ Play All
              </button>
              <button className="btn btn-secondary">🔀 Shuffle</button>
            </div>
          )}
        </div>
      </div>

      {liked.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🤍</span>
          <h3>No liked songs yet</h3>
          <p>
            Songs you like will appear here. Click the heart icon on any song to save it.
          </p>
        </div>
      ) : (
        <div>
          {/* Table Header */}
          <div className="song-row" style={{ cursor: "default", opacity: 0.5, marginBottom: 4 }}>
            <div className="song-row-num">#</div>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
            <div className="song-row-album" style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Album</div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
          <div className="song-list">
            {liked.map((song, i) => (
              <div
                key={song.id}
                className={`song-row ${currentSong?.id === song.id ? "playing" : ""}`}
                onClick={() => onPlay(song)}
              >
                <div className="song-row-num">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="wave-bars" style={{ justifyContent: "center" }}>
                      <span /><span /><span /><span />
                    </div>
                  ) : i + 1}
                </div>
                <div className="song-row-info">
                  <div className="song-row-thumb-placeholder" style={{
                    background: `linear-gradient(135deg, ${song.color}88, ${song.color}33)`,
                  }}>
                    {song.emoji}
                  </div>
                  <div>
                    <div className="song-row-name">{song.title}</div>
                    <div className="song-row-artist">{song.artist}</div>
                  </div>
                </div>
                <div className="song-row-album">{song.album}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    className="player-like-btn liked"
                    onClick={e => { e.stopPropagation(); onLike(song.id); }}
                    title="Remove from liked"
                  >
                    ❤️
                  </button>
                  <span className="song-row-duration">{formatDuration(song.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
