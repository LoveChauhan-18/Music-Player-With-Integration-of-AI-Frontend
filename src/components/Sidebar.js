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

  const getMoodColor = () => {
    switch (activePage) {
      case 'mood': return '#8b5cf6';
      case 'creator': return '#d946ef';
      case 'explore': return '#10b981';
      case 'podcasts': return '#f59e0b';
      case 'liked': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  const moodColor = getMoodColor();

  return (
    <aside 
      className="sidebar" 
      style={{ 
        display: "flex", 
        flexDirection: "column",
        "--sidebar-mood-color": moodColor
      }}
    >
      <div className="sidebar-ambient-glow" />
      <div style={{ flex: 1, overflowY: "auto", position: 'relative', zIndex: 1 }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon-wrapper">
            <div className="sidebar-logo-icon">🎵</div>
            <div className="sidebar-logo-pulse" />
          </div>
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

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user ? (
            <>
              <div className="sidebar-user-avatar" style={{ background: `linear-gradient(135deg, ${moodColor}, #06b6d4)` }}>
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

        {/* Unique Feature: Ambient Visualizer Orb */}
        <div className="sidebar-visualizer-orb">
          <div className="orb-wave wave-1" />
          <div className="orb-wave wave-2" />
          <div className="orb-wave wave-3" />
        </div>
      </div>
    </aside>
  );
}
