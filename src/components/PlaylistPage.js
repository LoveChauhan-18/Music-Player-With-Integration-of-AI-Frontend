import React from "react";
import { SONGS, PLAYLISTS, formatDuration } from "../data/songs";

export default function PlaylistPage({ playlistId, currentSong, isPlaying, onPlay, onLike, likedSongs }) {
  const playlist = PLAYLISTS.find(p => p.id === playlistId);
  if (!playlist) return null;

  const songs = playlist.songs.map(id => SONGS.find(s => s.id === id)).filter(Boolean);
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalDuration / 60);

  return (
    <div className="page">
      {/* Hero */}
      <div className="playlist-hero">
        <div style={{
          width: 180, height: 180,
          borderRadius: "var(--radius-lg)",
          background: `linear-gradient(135deg, ${playlist.color}aa, ${playlist.color}33)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72,
          boxShadow: `0 16px 48px ${playlist.color}44`,
          flexShrink: 0,
        }}>
          {playlist.emoji}
        </div>
        <div className="playlist-hero-info">
          <div className="playlist-type-tag">Playlist</div>
          <h1 className="playlist-hero-title">{playlist.name}</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>{playlist.description}</p>
          <div className="playlist-hero-meta">
            {playlist.createdBy} · {songs.length} songs · {totalMins} min
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
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
        {songs.map((song, i) => (
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
                className={`player-like-btn ${likedSongs.includes(song.id) ? "liked" : ""}`}
                onClick={e => { e.stopPropagation(); onLike(song.id); }}
                style={{ opacity: likedSongs.includes(song.id) ? 1 : 0.3 }}
              >
                {likedSongs.includes(song.id) ? "❤️" : "🤍"}
              </button>
              <span className="song-row-duration">{formatDuration(song.duration)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
