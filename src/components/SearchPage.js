import React, { useState, useEffect, useCallback } from "react";
import { searchMusic } from "../services/musicApi";
import { formatDuration } from "../data/songs";

function SearchResultCard({ song, isCurrentSong, isPlaying, onPlay, onLike, isLiked }) {
  return (
    <div
      className={`song-card ${isCurrentSong ? "playing" : ""}`}
      onClick={() => onPlay(song)}
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
            style={{ background: `linear-gradient(135deg, #8b5cf655, #8b5cf622)` }}
          >
            <span style={{ fontSize: 40 }}>🎵</span>
          </div>
        )}
        <div className="song-card-play-overlay">
          <button className="btn-play btn-play-sm">
            {isCurrentSong && isPlaying ? "⏸" : "▶"}
          </button>
        </div>
        {isCurrentSong && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,0,0,0.7)", borderRadius: 99, padding: "2px 8px"
          }}>
            <div className="wave-bars" style={{ height: 14 }}>
              <span/><span/><span/><span/>
            </div>
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: "rgba(0,0,0,0.7)", borderRadius: 99,
          padding: "2px 8px", fontSize: 10, fontWeight: 700,
          color: "var(--accent-purple)", letterSpacing: 0.5,
        }}>
          iTunes
        </div>
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
            onLike(song.id, song); // Pass the whole song object in case we need to save it to DB
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

export default function SearchPage({ initialQuery, currentSong, isPlaying, onPlay, onLike, likedSongs }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchMusic(searchTerm, 40);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>
            🔍 Global Search
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Find your favorite tracks across the globe via iTunes.
          </p>
        </div>
        {query && (
          <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
            Showing results for <span style={{ color: "var(--accent-purple)" }}>"{query}"</span>
          </div>
        )}
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 32 }}>
        <div className="topbar-search" style={{ maxWidth: "none", height: 50, background: "rgba(255,255,255,0.05)" }}>
          <span className="topbar-search-icon" style={{ fontSize: 20 }}>🔍</span>
          <input
            autoFocus
            placeholder="Search for songs, artists, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: 16 }}
          />
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading || !query.trim()}
            style={{ marginRight: 6, padding: "6px 20px" }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="empty-state">
           <span className="empty-state-icon">⚠️</span>
           <h3>Something went wrong</h3>
           <p>{error}</p>
           <button className="btn btn-secondary" onClick={() => performSearch(query)}>Try Again</button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="songs-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && results.length > 0 && (
        <div className="songs-grid" style={{ animation: "fadeInUp 0.4s ease" }}>
          {results.map((song) => (
            <SearchResultCard
              key={song.id}
              song={song}
              isCurrentSong={currentSong?.id === song.id}
              isPlaying={isPlaying}
              onPlay={onPlay}
              onLike={onLike}
              isLiked={likedSongs.includes(song.id)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🛸</span>
          {query ? (
              <>
                <h3>No results found</h3>
                <p>We couldn't find anything matching "{query}". Try another search!</p>
              </>
          ) : (
              <>
                <h3>Start Exploring</h3>
                <p>Type something in the search bar above to discover music from millions of tracks.</p>
              </>
          )}
        </div>
      )}
    </div>
  );
}
