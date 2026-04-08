import React, { useState, useEffect } from "react";
import { SONGS, formatDuration, formatPlays } from "../data/songs";
import { fetchLocalLibrary } from "../services/musicApi";

export default function LibraryPage({ currentSong, isPlaying, onPlay, onLike, likedSongs }) {
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [view, setView] = useState("grid"); // grid | list
  const [localSongs, setLocalSongs] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);

  useEffect(() => {
    async function getLocal() {
      const data = await fetchLocalLibrary();
      setLocalSongs(data);
      setLoadingLocal(false);
    }
    getLocal();
  }, []);

  const allSongs = [...localSongs, ...SONGS];
  const genres = ["All", ...new Set(allSongs.map(s => s.genre))];

  let filtered = allSongs.filter(s => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    );
  });

  if (filterGenre !== "All") {
    filtered = filtered.filter(s => s.genre === filterGenre);
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "artist") return a.artist.localeCompare(b.artist);
    if (sortBy === "plays") return b.plays - a.plays;
    if (sortBy === "duration") return a.duration - b.duration;
    return 0;
  });

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>
          📚 Your Collection
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {SONGS.length + localSongs.length} tracks in your personal library
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
        {/* Search */}
        <div className="topbar-search" style={{ maxWidth: 280 }}>
          <span className="topbar-search-icon">🔍</span>
          <input
            placeholder="Filter your collection..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Genre Filter */}
        <select
          className="form-select"
          style={{ width: "auto", padding: "10px 16px" }}
          value={filterGenre}
          onChange={e => setFilterGenre(e.target.value)}
        >
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Sort */}
        <select
          className="form-select"
          style={{ width: "auto", padding: "10px 16px" }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="title">Sort: Title</option>
          <option value="artist">Sort: Artist</option>
          <option value="plays">Sort: Most Played</option>
          <option value="duration">Sort: Duration</option>
        </select>

        {/* View Toggle */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            className={`btn-icon ${view === "grid" ? "active" : ""}`}
            style={{ background: view === "grid" ? "rgba(139,92,246,0.2)" : undefined }}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            ▦
          </button>
          <button
            className={`btn-icon ${view === "list" ? "active" : ""}`}
            style={{ background: view === "list" ? "rgba(139,92,246,0.2)" : undefined }}
            onClick={() => setView("list")}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <h3>No songs found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="songs-grid">
          {filtered.map((song) => (
            <div
              key={song.id}
              className={`song-card ${currentSong?.id === song.id ? "playing" : ""}`}
              onClick={() => onPlay(song)}
            >
              <div className="song-card-art">
                <div className="song-card-art-placeholder" style={{
                  background: `linear-gradient(135deg, ${song.color}55, ${song.color}22)`,
                }}>
                  <span style={{ fontSize: 48 }}>{song.emoji}</span>
                </div>
                <div className="song-card-play-overlay">
                  <button className="btn-play btn-play-sm">
                    {currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}
                  </button>
                </div>
                {currentSong?.id === song.id && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.6)", borderRadius: 99, padding: "2px 8px"
                  }}>
                    <div className="wave-bars" style={{ height: 14 }}><span/><span/><span/><span/></div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="song-card-title">{song.title}</div>
                  <div className="song-card-artist">{song.artist}</div>
                  {song.source === "local" && (
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginTop: 4 }}>
                      📁 Project Internal
                    </div>
                  )}
                </div>
                <button
                  className={`player-like-btn ${likedSongs.includes(song.id) ? "liked" : ""}`}
                  onClick={e => { e.stopPropagation(); onLike(song.id); }}
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                </button>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 8, fontSize: 11,
                color: "var(--text-muted)",
              }}>
                <span style={{
                  background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 99,
                }}>{song.genre}</span>
                <span>{formatDuration(song.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* List Header */}
          <div className="song-row" style={{ cursor: "default", opacity: 0.5, marginBottom: 4 }}>
            <div className="song-row-num">#</div>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
            <div className="song-row-album" style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Album</div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
          <div className="song-list">
            {filtered.map((song, i) => (
              <div
                key={song.id}
                className={`song-row ${currentSong?.id === song.id ? "playing" : ""}`}
                onClick={() => onPlay(song)}
              >
                <div className="song-row-num">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="wave-bars" style={{ justifyContent: "center" }}><span/><span/><span/><span/></div>
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
                    <div className="song-row-artist">{song.artist} · {formatPlays(song.plays)} plays</div>
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
      )}
    </div>
  );
}
