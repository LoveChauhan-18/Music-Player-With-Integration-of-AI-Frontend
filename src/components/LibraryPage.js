import React, { useState, useEffect } from "react";
import { SONGS, formatDuration, formatPlays } from "../data/songs";
import { fetchLocalLibrary } from "../services/musicApi";

export default function LibraryPage({ currentSong, isPlaying, onPlay, onLike, likedSongs, playlists, onAddToPlaylist }) {
  const [activeTab, setActiveTab] = useState("playlists"); // playlists | artists | albums | songs
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [view, setView] = useState("grid"); // grid | list
  const [visibleCount, setVisibleCount] = useState(50);
  const [localSongs, setLocalSongs] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [activeSongMenu, setActiveSongMenu] = useState(null);

  useEffect(() => {
    async function getLocal() {
      const data = await fetchLocalLibrary();
      setLocalSongs(data);
      setLoadingLocal(false);
    }
    getLocal();
  }, []);

  const allSongs = [...localSongs, ...SONGS];

  // Extract unique Artists and Albums
  const artistsMap = new Map();
  const albumsMap = new Map();

  allSongs.forEach(s => {
    const artistName = typeof s.artist === 'object' ? s.artist.name : (s.artist || "Unknown Artist");
    if (!artistsMap.has(artistName)) {
      artistsMap.set(artistName, { name: artistName, count: 1, artwork: s.artwork || s.artwork_url, color: s.color });
    } else {
      artistsMap.get(artistName).count++;
    }

    if (s.album && s.album !== "Unknown") {
      if (!albumsMap.has(s.album)) {
        albumsMap.set(s.album, { name: s.album, artist: artistName, artwork: s.artwork || s.artwork_url, color: s.color });
      }
    }
  });

  const uniqueArtists = Array.from(artistsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const uniqueAlbums = Array.from(albumsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const genres = ["All", ...new Set(allSongs.map(s => s.genre).filter(Boolean))];

  let filtered = allSongs.filter(s => {
    const q = search.toLowerCase();
    const artistName = typeof s.artist === 'object' ? s.artist.name : (s.artist || "");
    return (
      s.title.toLowerCase().includes(q) ||
      artistName.toLowerCase().includes(q) ||
      (s.album && s.album.toLowerCase().includes(q))
    );
  });

  if (filterGenre !== "All") {
    filtered = filtered.filter(s => s.genre === filterGenre);
  }

  filtered = [...filtered].sort((a, b) => {
    const aTitle = a.title || "";
    const bTitle = b.title || "";
    const aArtist = typeof a.artist === 'object' ? a.artist.name : (a.artist || "");
    const bArtist = typeof b.artist === 'object' ? b.artist.name : (b.artist || "");

    if (sortBy === "title") return aTitle.localeCompare(bTitle);
    if (sortBy === "artist") return aArtist.localeCompare(bArtist);
    if (sortBy === "plays") return (b.plays || 0) - (a.plays || 0);
    if (sortBy === "duration") return (a.duration || 0) - (b.duration || 0);
    return 0;
  });

  // Reset pagination when filtering
  useEffect(() => {
    setVisibleCount(50);
  }, [search, filterGenre, sortBy]);

  const visibleSongs = filtered.slice(0, visibleCount);

  const renderTabs = () => (
    <div className="library-tabs" style={{ 
      display: "flex", 
      gap: 32, 
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      marginBottom: 32,
      paddingBottom: 2
    }}>
      {["playlists", "artists", "albums", "songs"].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.5)",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            position: "relative",
            textTransform: "capitalize",
            transition: "all 0.3s ease"
          }}
        >
          {tab}
          {activeTab === tab && (
            <div style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 2,
              background: "var(--accent-purple)",
              borderRadius: 2
            }} className="animate-fade-in" />
          )}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "playlists":
        return (
          <div className="songs-grid">
            {playlists.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <span style={{ fontSize: 48 }}>📂</span>
                <h3>No playlists yet</h3>
                <p>Create your first playlist in the sidebar!</p>
              </div>
            ) : (
              playlists.map(pl => {
                const firstSong = pl.songs && pl.songs.length > 0 ? pl.songs[0] : null;
                const coverImg = firstSong ? (firstSong.artwork || firstSong.artwork_url) : null;
                
                return (
                  <div key={pl.id} className="song-card" style={{ cursor: "pointer" }}>
                    <div className="song-card-art">
                      {coverImg ? (
                        <img 
                          src={coverImg} 
                          alt="" 
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        <div className="song-card-art-placeholder" style={{ background: `linear-gradient(135deg, ${pl.color || '#8b5cf6'}88, ${pl.color || '#8b5cf6'}44)` }}>
                          <span style={{ fontSize: 48 }}>{pl.emoji || '📁'}</span>
                        </div>
                      )}
                    </div>
                    <div className="song-card-title">{pl.name}</div>
                    <div className="song-card-artist">{pl.songs?.length || 0} songs</div>
                  </div>
                );
              })
            )}
          </div>
        );
      case "artists":
        return (
          <div className="songs-grid">
            {uniqueArtists.map(artist => (
              <div key={artist.name} className="song-card" style={{ cursor: "pointer" }} onClick={() => { setSearch(artist.name); setActiveTab("songs"); }}>
                <div className="song-card-art" style={{ borderRadius: "50%", overflow: "hidden" }}>
                  {artist.artwork ? (
                    <img src={artist.artwork} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="song-card-art-placeholder" style={{ background: (artist.color || '#8b5cf6') + "44" }}>👤</div>
                  )}
                </div>
                <div className="song-card-title" style={{ textAlign: "center" }}>{artist.name}</div>
                <div className="song-card-artist" style={{ textAlign: "center" }}>Artist • {artist.count} tracks</div>
              </div>
            ))}
          </div>
        );
      case "albums":
        return (
          <div className="songs-grid">
            {uniqueAlbums.map(album => (
              <div key={album.name} className="song-card" style={{ cursor: "pointer" }} onClick={() => { setSearch(album.name); setActiveTab("songs"); }}>
                <div className="song-card-art">
                  {album.artwork ? (
                    <img src={album.artwork} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="song-card-art-placeholder" style={{ background: (album.color || '#8b5cf6') + "44" }}>💿</div>
                  )}
                </div>
                <div className="song-card-title">{album.name}</div>
                <div className="song-card-artist">{album.artist}</div>
              </div>
            ))}
          </div>
        );
      case "songs":
      default:
        return (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
              <div className="topbar-search" style={{ maxWidth: 280 }}>
                <span className="topbar-search-icon">🔍</span>
                <input
                  placeholder="Filter your collection..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="form-select" style={{ width: "auto", padding: "10px 16px" }} value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select className="form-select" style={{ width: "auto", padding: "10px 16px" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="title">Sort: Title</option>
                <option value="artist">Sort: Artist</option>
                <option value="plays">Sort: Most Played</option>
                <option value="duration">Sort: Duration</option>
              </select>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className={`btn-icon ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} title="Grid view">▦</button>
                <button className={`btn-icon ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} title="List view">☰</button>
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
                {visibleSongs.map((song) => (
                  <div key={song.id} className={`song-card ${currentSong?.id === song.id ? "playing" : ""}`} onClick={() => onPlay(song)}>
                    <div className="song-card-art">
                      {(song.artwork || song.artwork_url) ? (
                        <img src={song.artwork || song.artwork_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="song-card-art-placeholder" style={{ background: (song.color || '#8b5cf6') + "44" }}>{song.emoji || '🎵'}</div>
                      )}
                      <div className="song-card-play-overlay">
                        <button className="btn-play btn-play-sm">{currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="song-card-title">{song.title}</div>
                        <div className="song-card-artist">{typeof song.artist === 'object' ? song.artist.name : song.artist}</div>
                      </div>
                      <button className={`player-like-btn ${likedSongs.includes(song.id) ? "liked" : ""}`} onClick={e => { e.stopPropagation(); onLike(song.id, song); }}>
                        {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="song-list">
                  {visibleSongs.map((song, i) => (
                    <div key={song.id} className={`song-row ${currentSong?.id === song.id ? "playing" : ""}`} onClick={() => onPlay(song)}>
                      <div className="song-row-num">{currentSong?.id === song.id && isPlaying ? "🔊" : i + 1}</div>
                      <div className="song-row-info">
                        {(song.artwork || song.artwork_url) ? (
                          <img src={song.artwork || song.artwork_url} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", marginRight: 12 }} />
                        ) : (
                          <div className="song-row-thumb-placeholder" style={{ background: `linear-gradient(135deg, ${song.color || '#333'}88, ${song.color || '#333'}33)`, marginRight: 12 }}>{song.emoji || '🎵'}</div>
                        )}
                        <div>
                          <div className="song-row-name">{song.title}</div>
                          <div className="song-row-artist">{typeof song.artist === 'object' ? song.artist.name : song.artist}</div>
                        </div>
                      </div>
                      <div className="song-row-album">{song.album}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                        <button className={`player-like-btn ${likedSongs.includes(song.id) ? "liked" : ""}`} onClick={e => { e.stopPropagation(); onLike(song.id, song); }}>
                          {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                        </button>
                        <span className="song-row-duration">{formatDuration(song.duration)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="page animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>
          📚 Your Collection
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Browse your music by playlists, artists, albums, or tracks.
        </p>
      </div>

      {renderTabs()}
      {renderContent()}

      {activeTab === "songs" && visibleCount < filtered.length && (
        <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 40 }}>
          <button className="btn btn-secondary" onClick={() => setVisibleCount(prev => prev + 50)} style={{ padding: "12px 32px", fontSize: 16 }}>
            Load More Songs
          </button>
        </div>
      )}
    </div>
  );
}
