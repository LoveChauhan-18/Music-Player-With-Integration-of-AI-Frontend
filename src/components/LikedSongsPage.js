import React from "react";
import { SONGS, formatDuration } from "../data/songs";

export default function LikedSongsPage({ currentSong, isPlaying, onPlay, onLike, likedSongs, allSongs = [] }) {
  // Deduplicate songs by ID to prevent double listings
  // Combine static SONGS with the dynamic allSongs (which contains synced liked songs)
  const songMap = new Map();
  
  // Add static songs first
  SONGS.forEach(s => songMap.set(s.id, s));
  
  // Add/Overwrite with dynamic songs from backend (they often have more up-to-date metadata)
  allSongs.forEach(s => {
    if (s && s.id) songMap.set(s.id, s);
  });

  // Filter the final map by the likedSongs IDs provided by App.js
  const rawLiked = likedSongs
    .map(id => songMap.get(id))
    .filter(s => s !== undefined);

  // Final deduplication layer to ensure no song is listed twice
  const liked = [];
  const seenIds = new Set();
  rawLiked.forEach(s => {
    if (!seenIds.has(s.id)) {
      liked.push(s);
      seenIds.add(s.id);
    }
  });

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
                  { (song.artwork || song.artwork_url) ? (
                    <img 
                      src={song.artwork || song.artwork_url} 
                      alt="" 
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", marginRight: 12 }} 
                    />
                  ) : (
                    <div className="song-row-thumb-placeholder" style={{
                      background: `linear-gradient(135deg, ${song.color || '#8b5cf6'}88, ${song.color || '#8b5cf6'}33)`,
                      marginRight: 12
                    }}>
                      {song.emoji || '🎵'}
                    </div>
                  )}
                  <div>
                    <div className="song-row-name">{song.title}</div>
                    <div className="song-row-artist">{typeof song.artist === 'object' ? song.artist.name : song.artist}</div>
                  </div>
                </div>
                <div className="song-row-album" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {song.source === "itunes" && (
                    <button
                      className="btn-preview"
                      onClick={(e) => { e.stopPropagation(); onPlay(song, [], true); }}
                      title="Play 30s Preview"
                      style={{ height: 24, padding: "0 8px", fontSize: 9 }}
                    >
                      PREVIEW
                    </button>
                  )}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {song.album}
                  </span>
                </div>
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
