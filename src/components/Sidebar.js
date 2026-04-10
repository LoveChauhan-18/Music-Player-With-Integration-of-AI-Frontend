import React from "react";
import { PLAYLISTS } from "../data/songs";

const NAV_ITEMS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "explore", icon: "🌍", label: "Explore" },
  { id: "search", icon: "🔍", label: "Search" },
  { id: "library", icon: "📚", label: "Your Library" },
  { id: "mood", icon: "🧠", label: "AI Mood" },
  { id: "creator", icon: "✨", label: "AI Creator" },
  { id: "podcasts", icon: "🎙️", label: "Podcasts" },
  { id: "cartoons", icon: "📺", label: "Cartoons" },
  { id: "anime", icon: "🎌", label: "Anime" },
  { id: "liked", icon: "❤️", label: "Liked Songs" },
];

export default function Sidebar({ activePage, setActivePage, likedSongs, playlists, user, onLogout }) {
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

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎵</div>
          <span className="sidebar-logo-text">AI-Music-Player</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "liked" && likedSongs.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "rgba(139,92,246,0.2)",
                    color: "var(--accent-purple)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "99px",
                  }}
                >
                  {likedSongs.length}
                </span>
              )}
            </button>
          ))}

          <span className="nav-section-label" style={{ marginTop: 16 }}>
            Your Playlists
          </span>
        </nav>

        <div className="sidebar-playlists">
          {playlists.map((pl) => {
            const emoji = getPlaylistEmoji(pl.name);
            const color = getPlaylistColor(pl.name);
            return (
              <div
                key={pl.id}
                className={`playlist-item ${activePage === `playlist_${pl.id}` ? "active" : ""}`}
                onClick={() => setActivePage(`playlist_${pl.id}`)}
              >
                <div
                  className="playlist-item-art no-img"
                  style={{ background: `linear-gradient(135deg, ${color}88, ${color}44)` }}
                >
                  {emoji}
                </div>
                <div className="playlist-item-info">
                  <div className="playlist-item-name">{pl.name}</div>
                  <div className="playlist-item-count">
                    {pl.songs?.length || 0} songs
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sidebar-user" style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
        {user ? (
          <>
            <div className="sidebar-user-avatar" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              {user[0].toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user}</div>
              <button 
                className="btn-text" 
                style={{ fontSize: 11, textAlign: "left", opacity: 0.6, padding: 0 }}
                onClick={onLogout}
              >
                Logout Account
              </button>
            </div>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", fontSize: 13, gap: 8 }}
            onClick={() => setActivePage("auth")}
          >
            👤 Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
