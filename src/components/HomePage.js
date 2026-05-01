import React, { useState, useEffect } from "react";
import { SONGS, formatDuration, formatPlays } from "../data/songs";
import { fetchLatestGlobal } from "../services/musicApi";

function SongRow({ song, index, isPlaying, isCurrentSong, onPlay, onLike, isLiked, playlists, onAddToPlaylist }) {
  const [showMenu, setShowMenu] = React.useState(false);
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
        {(song.artwork || song.artwork_url) ? (
          <img src={song.artwork || song.artwork_url} alt="" className="song-row-thumb" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} />
        ) : (
          <div className="song-row-thumb-placeholder" style={{
            background: `linear-gradient(135deg, ${song.color || '#333'}88, ${song.color || '#333'}33)`,
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
            style={{ height: 24, padding: "0 8px", fontSize: 9 }}
            onClick={(e) => { e.stopPropagation(); onPlay(song, [], true); }}
            title="Play 30s Preview"
          >
            PREVIEW
          </button>
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {song.album}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
        <div style={{ position: "relative" }}>
          <button 
            className="btn-text" 
            style={{ fontSize: 18, opacity: 0.5 }}
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            ➕
          </button>
          {showMenu && (
            <div className="playlist-dropdown glass animate-fade-in" style={{ bottom: "30px", right: 0 }}>
              <div className="dropdown-header">Add to Playlist</div>
              {playlists.map(pl => (
                <button 
                  key={pl.id} 
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(pl.id, song);
                    setShowMenu(false);
                  }}
                >
                   {pl.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className={`player-like-btn ${isLiked ? "liked" : ""}`}
          onClick={(e) => { e.stopPropagation(); onLike(song.id, song); }}
          style={{ opacity: isLiked ? 1 : 0.3, transition: "opacity 0.2s" }}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <span className="song-row-duration">{formatDuration(song.duration)}</span>
      </div>
    </div>
  );
}

export default function HomePage({ 
  currentSong, 
  isPlaying, 
  onPlay, 
  onLike, 
  likedSongs, 
  setActivePage, 
  playlists, 
  onAddToPlaylist,
  recentlyPlayed = []
}) {
  const [activeSongMenu, setActiveSongMenu] = useState(null); // ID of song showing menu
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
               onClick={() => onPlay(song, latestSongs, false)}
              style={{ overflow: activeSongMenu === song.id ? "visible" : undefined }}
            >
              <div className="song-card-art">
                {song.artwork ? (
                  <img src={song.artwork} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div className="song-card-art-placeholder" style={{ background: (song.color || '#8b5cf6') + "44" }}>{song.emoji || '🎵'}</div>
                )}

                <button
                  className={`song-card-like ${likedSongs.includes(song.id) ? "liked" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onLike(song.id, song); }}
                >
                  {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                </button>

                <div className="song-card-play-overlay">
                  <button className="btn-play btn-play-sm">
                    {currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}
                  </button>
                </div>
              </div>

              {/* Playlist ➕ button — outside song-card-art to avoid overflow:hidden clipping */}
              <div style={{ position: "absolute", top: 10, right: 10, zIndex: 200 }}>
                <button
                  className="btn-action"
                  onClick={(e) => { e.stopPropagation(); setActiveSongMenu(activeSongMenu === song.id ? null : song.id); }}
                >
                  ➕
                </button>
                {activeSongMenu === song.id && (
                  <div className="playlist-dropdown glass animate-fade-in" style={{ top: "36px", right: 0, zIndex: 300 }}>
                    <div className="dropdown-header">Add to Playlist</div>
                    {playlists.length === 0 && (
                      <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-muted)" }}>Login to see playlists</div>
                    )}
                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        className="dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPlaylist(pl.id, song);
                          setActiveSongMenu(null);
                        }}
                      >
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="song-card-title">{song.title}</div>
              <div className="song-card-artist">{typeof song.artist === 'object' ? song.artist.name : song.artist}</div>
              {song.source === "itunes" && (
                <button
                  className="btn-preview"
                  onClick={(e) => { e.stopPropagation(); onPlay(song, [], true); }}
                >
                  ▶ 30s PREVIEW
                </button>
              )}
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
             onClick={() => onPlay(song, trending, false)}
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

      {/* Recently Played */}
      <div className="section-header">
        <h2 className="section-title">🕒 Recently Played</h2>
      </div>
      
      {recentlyPlayed.length > 0 ? (
        <>
          <div className="song-row" style={{ cursor: "default", opacity: 0.5, marginBottom: 4 }}>
            <div className="song-row-num">#</div>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
            <div className="song-row-album" style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Album</div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
          <div className="song-list">
            {recentlyPlayed.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                 onPlay={(s, q, f) => onPlay(s, q || recentlyPlayed, f)}
                onLike={onLike}
                isLiked={likedSongs.includes(song.id)}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state" style={{ padding: "40px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
          <span style={{ fontSize: 32, marginBottom: 12, display: "block" }}>🎧</span>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your play history will appear here. Start listening to music!</p>
        </div>
      )}
    </div>
  );
}
