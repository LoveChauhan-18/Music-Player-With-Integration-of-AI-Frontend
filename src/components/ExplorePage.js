import React, { useState, useEffect, useCallback } from "react";
import { EXPLORE_CATEGORIES } from "../services/musicApi";
import { formatDuration } from "../data/songs";

function SongCard({ song, isCurrentSong, isPlaying, onPlay, onLike, isLiked, categoryColor, playlists, onAddToPlaylist }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div
      className={`song-card ${isCurrentSong ? "playing" : ""}`}
      onClick={() => onPlay(song)}
      style={{ overflow: showMenu ? "visible" : undefined }}
    >
      <div className="song-card-art">
        {song.artwork ? (
          <img
            src={song.artwork}
            alt={song.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="song-card-art-placeholder"
            style={{ background: `linear-gradient(135deg, ${categoryColor}55, ${categoryColor}22)` }}
          >
            <span style={{ fontSize: 48 }}>🎵</span>
          </div>
        )}
        <div className="song-card-play-overlay">
          <button className="btn-play btn-play-sm">
            {isCurrentSong && isPlaying ? "⏸" : "▶"}
          </button>
        </div>
        {isCurrentSong && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(0,0,0,0.7)", borderRadius: 99, padding: "2px 8px"
          }}>
            <div className="wave-bars" style={{ height: 14 }}>
              <span/><span/><span/><span/>
            </div>
          </div>
        )}
        {song.previewUrl && (
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            background: "rgba(0,0,0,0.7)", borderRadius: 99,
            padding: "2px 8px", fontSize: 10, fontWeight: 700,
            color: categoryColor, letterSpacing: 0.5,
          }}>
            ▶ PREVIEW
          </div>
        )}
      </div>

      {/* Playlist ➕ button — outside song-card-art to avoid overflow:hidden clipping */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 200 }}>
        <button
          className="btn-action"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          ➕
        </button>
        {showMenu && (
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
                  setShowMenu(false);
                }}
              >
                {pl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="song-card-title">{song.title}</div>
          <div className="song-card-artist">{song.artist}</div>
        </div>
        <button
          className={`player-like-btn ${isLiked ? "liked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onLike(song.id, song);
          }}
          style={{ flexShrink: 0, marginTop: 4 }}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: 6, fontSize: 11, color: "var(--text-muted)"
      }}>
        <span style={{
          background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 99
        }}>
          {song.genre}
        </span>
        <span>{formatDuration(song.duration)}</span>
      </div>
    </div>
  );
}


function SkeletonCard() {
  return (
    <div className="song-card" style={{ pointerEvents: "none" }}>
      <div className="song-card-art">
        <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-md)" }} />
      </div>
      <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "60%" }} />
    </div>
  );
}

export default function ExplorePage({ currentSong, isPlaying, onPlay, onLike, likedSongs, playlists, onAddToPlaylist }) {
  const [activeCategory, setActiveCategory] = useState("bollywood");
  const [songs, setSongs] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  const cat = EXPLORE_CATEGORIES.find((c) => c.id === activeCategory);

  const loadCategory = useCallback(async (categoryId) => {
    if (songs[categoryId] || loading[categoryId]) return;
    setLoading((prev) => ({ ...prev, [categoryId]: true }));
    setErrors((prev) => ({ ...prev, [categoryId]: null }));
    try {
      const category = EXPLORE_CATEGORIES.find((c) => c.id === categoryId);
      const data = await category.fetcher();
      setSongs((prev) => ({ ...prev, [categoryId]: data }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [categoryId]: "Failed to load. Check your connection." }));
    } finally {
      setLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  }, [songs, loading]);

  // Load initial category
  useEffect(() => {
    loadCategory("bollywood");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setVisibleCount(20);
    loadCategory(id);
  };

  const categorySongs = songs[activeCategory] || [];
  const isLoading = loading[activeCategory];
  const error = errors[activeCategory];

  const filteredSongs = searchQuery.trim()
    ? categorySongs.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categorySongs;

  const visibleSongs = filteredSongs.slice(0, visibleCount);

  return (
    <div className="page">
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>
          🌍 Explore Music
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Discover real songs from around the world — powered by iTunes.
        </p>
      </div>

      {/* Category Hero Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14, marginBottom: 32,
      }}>
        {EXPLORE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "20px 18px",
              background: activeCategory === cat.id
                ? cat.gradient
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeCategory === cat.id ? "transparent" : "rgba(255,255,255,0.07)"}`,
              cursor: "pointer",
              transition: "all 0.25s ease",
              position: "relative",
              overflow: "hidden",
              transform: activeCategory === cat.id ? "scale(1.02)" : "scale(1)",
              boxShadow: activeCategory === cat.id
                ? `0 12px 32px ${cat.color}44`
                : "none",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.flag}</div>
            <div style={{
              fontWeight: 700, fontSize: 15, marginBottom: 4,
              color: activeCategory === cat.id ? "white" : "var(--text-primary)",
            }}>
              {cat.shortLabel}
            </div>
            <div style={{
              fontSize: 12,
              color: activeCategory === cat.id ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
            }}>
              {cat.description}
            </div>
            {songs[cat.id] && (
              <div style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(255,255,255,0.2)", borderRadius: 99,
                padding: "2px 8px", fontSize: 11, fontWeight: 700,
              }}>
                {songs[cat.id].length}
              </div>
            )}
            {loading[cat.id] && (
              <div style={{
                position: "absolute", top: 12, right: 12,
                fontSize: 14, animation: "spin 1s linear infinite",
                display: "inline-block",
              }}>
                ⟳
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Category Section */}
      {cat && (
        <>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 20,
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {cat.flag} {cat.shortLabel} Charts
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {cat.description} · Real songs via iTunes
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search within category */}
              <div className="topbar-search" style={{ maxWidth: 220 }}>
                <span className="topbar-search-icon">🔍</span>
                <input
                  placeholder={`Search ${cat.shortLabel}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredSongs.length > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ background: cat.gradient, border: "none" }}
                  onClick={() => filteredSongs.length > 0 && onPlay(filteredSongs[0])}
                >
                  ▶ Play All
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSongs((prev) => ({ ...prev, [activeCategory]: undefined }));
                  setLoading((prev) => ({ ...prev, [activeCategory]: false }));
                  setTimeout(() => loadCategory(activeCategory), 100);
                }}
                title="Refresh"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* iTunes attribution notice */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24,
            fontSize: 12, color: "var(--text-muted)",
          }}>
            <span>🎵</span>
            <span>
              Music data from <strong style={{ color: "var(--text-secondary)" }}>iTunes Search API</strong>.
              Preview clips are 30-second samples. Click any song to play its preview.
            </span>
          </div>

          {/* Error State */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-lg)", padding: "24px", textAlign: "center", marginBottom: 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Failed to load {cat.shortLabel} music</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{error}</div>
              <button className="btn btn-secondary" onClick={() => {
                setSongs((p) => ({ ...p, [activeCategory]: undefined }));
                setLoading((p) => ({ ...p, [activeCategory]: false }));
                setTimeout(() => loadCategory(activeCategory), 100);
              }}>
                🔄 Try Again
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="songs-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Songs Grid */}
          {!isLoading && !error && filteredSongs.length > 0 && (
            <>
              <div className="songs-grid">
                {visibleSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isCurrentSong={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    onPlay={onPlay}
                    onLike={onLike}
                    isLiked={likedSongs.includes(song.id)}
                    categoryColor={cat.color}
                    playlists={playlists}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                ))}
              </div>
              
              {visibleCount < filteredSongs.length && (
                <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 40 }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    style={{ padding: "12px 32px", fontSize: 16 }}
                  >
                    Load More Tracks
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty after search */}
          {!isLoading && !error && filteredSongs.length === 0 && categorySongs.length > 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No results found</h3>
              <p>Try a different search term within {cat.shortLabel}.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
