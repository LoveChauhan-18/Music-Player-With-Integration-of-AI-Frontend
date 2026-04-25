import React from "react";
import { formatDuration } from "../data/songs";

export default function PlaylistPage({ playlist, currentSong, isPlaying, onPlay, onLike, likedSongs }) {
  if (!playlist) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div className="loading-spinner" />
    </div>
  );

  const getPlaylistEmoji = (name) => {
    if (name.includes("Favourites") || name.includes("Liked")) return "❤️";
    if (name.includes("Workout")) return "💪";
    if (name.includes("Chill")) return "🌊";
    if (name.includes("Focus")) return "🎯";
    return "🎵";
  };

  const getPlaylistColor = (name) => {
    if (name.includes("Favourites") || name.includes("Liked")) return "#ef4444";
    if (name.includes("Workout")) return "#f97316";
    if (name.includes("Chill")) return "#06b6d4";
    if (name.includes("Focus")) return "#8b5cf6";
    return "#10b981";
  };

  const emoji = getPlaylistEmoji(playlist.name);
  const color = getPlaylistColor(playlist.name);
  const songs = (playlist.songs || []).map(s => ({
    ...s,
    // Normalize backend snake_case fields to frontend camelCase
    previewUrl: s.previewUrl || s.preview_url,
    artwork: s.artwork || s.artwork_url,
    artist: typeof s.artist === 'object' ? s.artist?.name : s.artist,
  }));
  
  // Convert duration from seconds to minutes for the header
  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalMins = Math.floor(totalDuration / 60);

  return (
    <div className="page">
      {/* Hero */}
      <div className="playlist-hero">
        <div style={{
          width: 180, height: 180,
          borderRadius: "var(--radius-lg)",
          background: `linear-gradient(135deg, ${color}aa, ${color}33)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72,
          boxShadow: `0 16px 48px ${color}44`,
          flexShrink: 0,
        }}>
          {emoji}
        </div>
        <div className="playlist-hero-info">
          <div className="playlist-type-tag">Playlist</div>
          <h1 className="playlist-hero-title">{playlist.name}</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>Your curated collection of {playlist.name.toLowerCase()}.</p>
          <div className="playlist-hero-meta">
            You · {songs.length} songs · {totalMins} min
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              style={{ background: color, border: "none" }}
              onClick={() => songs.length > 0 && onPlay(songs[0])}
            >
              ▶ Play All
            </button>
            <button className="btn btn-secondary">🔀 Shuffle</button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="song-row" style={{ cursor: "default", opacity: 0.5, marginBottom: 4 }}>
        <div className="song-row-num">#</div>
        <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
        <div className="song-row-album" style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Album</div>
        <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
      <div className="song-list">
        {songs.map((song, i) => {
          // Flatten the song object if nested (backend might return full artist object)
          const artistName = typeof song.artist === 'object' ? song.artist.name : (song.artist || "Unknown Artist");
          
          return (
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
                {song.artwork ? (
                  <img 
                    src={song.artwork} 
                    alt={song.title} 
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", marginRight: 12 }} 
                  />
                ) : (
                  <div className="song-row-thumb-placeholder" style={{
                    background: `linear-gradient(135deg, ${color}88, ${color}33)`,
                  }}>
                    🎵
                  </div>
                )}
                <div>
                  <div className="song-row-name">{song.title}</div>
                  <div className="song-row-artist">{artistName}</div>
                </div>
              </div>
              <div className="song-row-album">{song.album || "Single"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                <button
                  className={`player-like-btn ${likedSongs.includes(song.id) ? "liked" : ""}`}
                  onClick={e => { e.stopPropagation(); onLike(song.id, song); }}
                  style={{ opacity: likedSongs.includes(song.id) ? 1 : 0.3 }}
                >
                  {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                </button>
                <span className="song-row-duration">{formatDuration(song.duration || 0)}</span>
              </div>
            </div>
          );
        })}
        {songs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
             <h3>This playlist is empty</h3>
             <p>Explore music and add your favorites here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
