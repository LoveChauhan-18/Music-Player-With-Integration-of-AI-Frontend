import React, { useState, useCallback } from "react";
import "./index.css";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Toast from "./components/Toast";
import HomePage from "./components/HomePage";
import LibraryPage from "./components/LibraryPage";
import MoodAIPage from "./components/MoodAIPage";
import SongCreatorPage from "./components/SongCreatorPage";
import LikedSongsPage from "./components/LikedSongsPage";
import PlaylistPage from "./components/PlaylistPage";
import ExplorePage from "./components/ExplorePage";
import SearchPage from "./components/SearchPage";
import AuthPage from "./components/AuthPage";
import PodcastPage from "./components/PodcastPage";
import CartoonPage from "./components/CartoonPage";
import AnimePage from "./components/AnimePage";
import VoiceControl from "./components/VoiceControl";


import { SONGS } from "./data/songs";
import { authService } from "./services/authService";
import { playlistService } from "./services/playlistService";

let toastId = 0;

const GalaxyBackground = () => (
  <div className="galaxy-bg">
    <div className="celestial moon">🌙</div>
    <div className="celestial sun">☀️</div>
    <div className="celestial planet planet-1">🪐</div>
    <div className="celestial planet planet-2">🌍</div>
    <div className="celestial planet planet-3">🌕</div>
    {Array.from({ length: 40 }).map((_, i) => (
      <div 
        key={i} 
        className="celestial star" 
        style={{ 
          top: `${Math.random() * 100}%`, 
          left: `${Math.random() * 100}%`, 
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          fontSize: `${Math.random() * 8 + 6}px`
        }}
      >
        ⭐
      </div>
    ))}
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [history, setHistory] = useState(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigate = useCallback((page) => {
    if (page === activePage) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(page);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActivePage(page);
  }, [activePage, history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevPage = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setActivePage(prevPage);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextPage = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setActivePage(nextPage);
    }
  }, [history, historyIndex]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [user, setUser] = useState(authService.getUser());
  const [libraryFetched, setLibraryFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "default");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "default" ? "galaxy" : "default");
  }, []);

  React.useEffect(() => {
    const initApp = async () => {
      // 1. Auth & Likes
      const savedUser = authService.getUser();
      if (savedUser) {
        setUser(savedUser);
        const likedIds = await playlistService.getLikedSongIds().catch(() => []);
        setLikedSongs(likedIds);
        
        // Fetch dynamic playlists
        const pl = await playlistService.getPlaylists().catch(() => []);
        setPlaylists(pl);
      }

      // 2. Initial Queue (800+ songs from local library)
      const { fetchLocalLibrary, syncLatestWithBackend } = await import("./services/musicApi");
      const lib = await fetchLocalLibrary();
      if (lib.length > 0) {
        setQueue(lib);
        setLibraryFetched(true);
      }

      // 3. Background Sync (Trigger auto-discovery of latest hits after 5s)
      setTimeout(async () => {
        try {
          console.log("🚀 Starting background sync for latest global hits...");
          await syncLatestWithBackend();
          // After sync, refresh the local library to show new hits
          const updatedLib = await fetchLocalLibrary();
          setQueue(updatedLib);
          console.log("✅ Background sync complete.");
        } catch (e) {
          console.warn("Background sync failed:", e);
        }
      }, 5000);
    };
    initApp();
  }, []);

  const showToast = useCallback((msg, type = "info", icon = "🎵") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, msg, type, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem("recentlyPlayed");
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  const handlePlay = useCallback(async (song, contextQueue, forcePreview = false) => {
    const { resolveFullAudio } = await import("./services/musicApi");

    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 20); // Keep last 20
    });

    if (currentSong?.id === song.id && !forcePreview) {
      setIsPlaying((p) => !p);
      return;
    }

    // 1. Set the song in the queue context
    if (contextQueue && contextQueue.length > 0) {
      setQueue(contextQueue);
    } else {
      setQueue(prev => {
        if (!prev.find(s => s.id === song.id)) return [...prev, song];
        return prev;
      });
    }

    // 2. Play logic
    if (forcePreview) {
      // Force 30s preview immediately
      setCurrentSong({ ...song, isFullAudio: false });
      setIsPlaying(true);
      showToast(`🎵 Playing 30s Preview: ${song.title}`, "info", "⏱️");
    } else {
      const needsResolve = song.source === "itunes" || (song.source === "local" && !song.audio_file && !song.previewUrl?.includes('/media/'));
      
      if (needsResolve) {
        showToast(`🔍 Resolving full audio for "${song.title}"...`, "info", "⏳");
        // We set the song but maybe don't start playing yet, or play a loading state?
        // Actually, let's set it so the player shows "Loading..."
        setCurrentSong({ ...song, isLoading: true });
        
        try {
          const fullAudioUrl = await resolve_with_timeout(
            resolveFullAudio(song.title, song.artist),
            30000
          );

          if (fullAudioUrl) {
            setCurrentSong({ ...song, previewUrl: fullAudioUrl, isFullAudio: true, isLoading: false });
            setIsPlaying(true);
            showToast(`✨ Full song loaded: "${song.title}"`, "success", "🔥");
          } else {
            showToast(`⚠️ Full audio unavailable. You can play the 30s preview instead.`, "warning", "ℹ️");
            setCurrentSong({ ...song, isLoading: false }); // Stop loading
          }
        } catch (e) {
          showToast(`❌ Resolution timed out for "${song.title}"`, "error", "⏱️");
          setCurrentSong({ ...song, isLoading: false });
        }
      } else {
        // Normal play for local/already resolved songs
        setCurrentSong(song);
        setIsPlaying(true);
        showToast(`Now playing: ${song.title}`, "info", "🎵");
      }
    }
  }, [currentSong, showToast]);

  // Helper for timeout
  const resolve_with_timeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
  };

  const handleNext = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    if (isShuffled) {
      // Pick a random song that isn't the current one
      const others = queue.filter(s => s.id !== currentSong.id);
      if (others.length === 0) return;
      const randomSong = others[Math.floor(Math.random() * others.length)];
      setCurrentSong(randomSong);
    } else {
      const idx = queue.findIndex((s) => s.id === currentSong.id);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % queue.length;
      setCurrentSong(queue[nextIdx]);
    }
    setIsPlaying(true);
  }, [currentSong, queue, isShuffled]);

  const handlePrev = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    if (isShuffled) {
      const others = queue.filter(s => s.id !== currentSong.id);
      if (others.length === 0) return;
      const randomSong = others[Math.floor(Math.random() * others.length)];
      setCurrentSong(randomSong);
    } else {
      const idx = queue.findIndex((s) => s.id === currentSong.id);
      const prevIdx = idx === -1 ? 0 : (idx - 1 + queue.length) % queue.length;
      setCurrentSong(queue[prevIdx]);
    }
    setIsPlaying(true);
  }, [currentSong, queue, isShuffled]);

  const handleToggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const handleLike = useCallback(async (songId, songMetadata = null) => {
    // If it's an iTunes song, the ID will be large or we'll have metadata
    const isDbSong = Number.isInteger(songId) && songId < 1000000;
    
    setLikedSongs((prev) => {
      const isLiked = prev.includes(songId);
      if (isLiked) {
        showToast("Removed from Liked Songs", "info", "💔");
        if (user) {
          playlistService.toggleLike(songId, songMetadata)
            .then(() => playlistService.getPlaylists())
            .then(setPlaylists)
            .catch(console.error);
        }
        return prev.filter((id) => id !== songId);
      } else {
        showToast("Added to Liked Songs!", "success", "❤️");
        if (user) {
          playlistService.toggleLike(songId, songMetadata)
            .then(() => playlistService.getPlaylists())
            .then(setPlaylists)
            .catch(console.error);
        }
        return [...prev, songId];
      }
    });
  }, [showToast, user]);

  const handleVoiceCommand = useCallback(async (command) => {
    switch (command.type) {
      case 'PLAY':
        setIsPlaying(true);
        showToast("Playing...", "info", "▶️");
        break;
      case 'PAUSE':
        setIsPlaying(false);
        showToast("Paused", "info", "⏸️");
        break;
      case 'NEXT':
        handleNext();
        showToast("Skipping to next...", "info", "⏭️");
        break;
      case 'PREV':
        handlePrev();
        showToast("Going back...", "info", "⏮️");
        break;
      case 'SEARCH_AND_PLAY':
        showToast(`Searching for "${command.query}"...`, "info", "🔍");
        try {
          const { searchMusic } = await import("./services/musicApi");
          const results = await searchMusic(command.query);
          if (results && results.length > 0) {
            handlePlay(results[0], results);
            showToast(`Playing "${results[0].title}"`, "success", "✨");
          } else {
            showToast(`Could not find "${command.query}"`, "warning", "❓");
          }
        } catch (e) {
          console.error("Voice search failed:", e);
          showToast("Search failed", "error", "❌");
        }
        break;
      default:
        break;
    }
  }, [handleNext, handlePrev, handlePlay, showToast]);


  const handleAddGenerated = useCallback((song) => {
    setGeneratedSongs((prev) => [song, ...prev]);
    setQueue((prev) => [song, ...prev]);
    setCurrentSong(song);
    setIsPlaying(true);
    showToast(`🎉 "${song.title}" created & playing!`, "success", "✨");
  }, [showToast]);

  const handleLoginSuccess = useCallback(async (username) => {
    setUser(username);
    setActivePage("home");
    showToast(`Welcome back, ${username}!`, "success", "👤");
    
    // Sync likes upon login
    const likedIds = await playlistService.getLikedSongIds();
    setLikedSongs([...new Set(likedIds)]);

    // Sync playlists upon login
    const pl = await playlistService.getPlaylists();
    setPlaylists(pl);
  }, [showToast]);

  const handleAddToPlaylist = useCallback(async (playlistId, song) => {
    if (!user) {
      showToast("Please login to add to playlists", "warning", "👤");
      setActivePage("auth");
      return;
    }

    try {
      await playlistService.addSongToPlaylist(playlistId, song.id, song);
      showToast(`Added to playlist!`, "success", "➕");
      
      // Refresh playlists to show new song
      const updated = await playlistService.getPlaylists();
      setPlaylists(updated);
    } catch (err) {
      showToast("Could not add to playlist", "error", "❌");
    }
  }, [user, showToast]);

  const handleCreatePlaylist = useCallback(async (name) => {
    if (!user) {
      showToast("Please login to create playlists", "warning", "👤");
      setActivePage("auth");
      return;
    }

    try {
      const newPlaylist = await playlistService.createPlaylist(name);
      showToast(`Playlist "${name}" created!`, "success", "📁");
      
      // Refresh playlists
      const updated = await playlistService.getPlaylists();
      setPlaylists(updated);
      
      // Switch to the new playlist page
      setActivePage(`playlist_${newPlaylist.id}`);
    } catch (err) {
      showToast("Could not create playlist", "error", "❌");
    }
  }, [user, showToast]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setActivePage("home");
    showToast("Logged out successfully", "info", "🚪");
  }, [showToast]);

  const renderPage = () => {
    if (activePage.startsWith("playlist_")) {
      const id = parseInt(activePage.split("_")[1]);
      const playlist = playlists.find(p => p.id === id);
      return (
        <PlaylistPage
          playlist={playlist}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onLike={handleLike}
          likedSongs={likedSongs}
        />
      );
    }
    switch (activePage) {
      case "home":
        return (
          <HomePage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            setActivePage={handleNavigate}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            recentlyPlayed={recentlyPlayed}
          />
        );
      case "search":
        return (
          <SearchPage
            initialQuery={searchQuery}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );
      case "library":
        return (
          <LibraryPage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );
      case "mood":
        return (
          <MoodAIPage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            allSongs={queue}
          />
        );
      case "explore":
        return (
          <ExplorePage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );
      case "creator":
        return (
          <SongCreatorPage onAddGenerated={handleAddGenerated} />
        );
      case "podcasts":
        return (
          <PodcastPage setIsPlaying={setIsPlaying} />
        );
      case "cartoons":
        return (
          <CartoonPage setIsPlaying={setIsPlaying} />
        );
      case "anime":
        return (
          <AnimePage setIsPlaying={setIsPlaying} />
        );
      case "liked":
        const likedPlaylist = playlists.find(p => p.name === "Liked Songs");
        return (
          <LikedSongsPage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            allSongs={likedPlaylist?.songs || []}
          />
        );
      case "auth":
        return (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            setActivePage={setActivePage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-layout">
        {theme === "galaxy" && <GalaxyBackground />}
        
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          likedSongs={likedSongs}
          playlists={playlists}
          user={user}
          onLogout={handleLogout}
          onCreatePlaylist={handleCreatePlaylist}
        />

        {/* Main Content */}
        <main className="app-main">
          <header className="topbar">
            <div className="topbar-nav-btns">
              <button 
                className="btn-icon" 
                title="Back" 
                onClick={goBack} 
                style={{ opacity: historyIndex > 0 ? 1 : 0.3, cursor: historyIndex > 0 ? "pointer" : "default" }}
              >
                ←
              </button>
              <button 
                className="btn-icon" 
                title="Forward" 
                onClick={goForward}
                style={{ opacity: historyIndex < history.length - 1 ? 1 : 0.3, cursor: historyIndex < history.length - 1 ? "pointer" : "default" }}
              >
                →
              </button>
            </div>
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input
                placeholder="Search globally with iTunes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== "search") handleNavigate("search");
                }}
                onFocus={() => handleNavigate("search")}
              />
            </div>
            <div className="topbar-right">
              <button
                className="btn-icon"
                title={`Switch to ${theme === "default" ? "Galaxy" : "Midnight"} Theme`}
                onClick={toggleTheme}
                style={{ fontSize: 20, marginRight: 8 }}
              >
                {theme === "default" ? "🌙" : "🌌"}
              </button>
              <VoiceControl onCommand={handleVoiceCommand} showToast={showToast} />
              {/* AI Badges */}
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "8px 14px" }}
                onClick={() => handleNavigate("mood")}
              >
                🧠 AI Mood
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: 12, padding: "8px 14px" }}
                onClick={() => handleNavigate("creator")}
              >
                ✨ Create Song
              </button>
              {user ? (
                <div 
                  className="sidebar-user-avatar" 
                  style={{ width: 36, height: 36, cursor: "pointer" }}
                  onClick={handleLogout}
                  title={`Logout ${user}`}
                >
                  {user[0].toUpperCase()}
                </div>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: 12, padding: "8px 14px" }}
                  onClick={() => setActivePage("auth")}
                >
                  👤 Login
                </button>
              )}
            </div>
          </header>

          {/* Page Content */}
          {renderPage()}
        </main>

        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={handleNext}
          onPrev={handlePrev}
          onLike={handleLike}
          isLiked={currentSong ? likedSongs.includes(currentSong.id) : false}
          isShuffled={isShuffled}
          onToggleShuffle={handleToggleShuffle}
        />

        {/* Mobile Navigation Bar */}
        <nav className="mobile-nav">
          <button 
            className={`mobile-nav-item ${activePage === "home" ? "active" : ""}`}
            onClick={() => setActivePage("home")}
          >
            <span className="mobile-nav-icon">🏠</span>
            <span>Home</span>
          </button>
          <button 
            className={`mobile-nav-item ${activePage === "explore" ? "active" : ""}`}
            onClick={() => setActivePage("explore")}
          >
            <span className="mobile-nav-icon">🌍</span>
            <span>Explore</span>
          </button>
          <button 
            className={`mobile-nav-item ${activePage === "search" ? "active" : ""}`}
            onClick={() => setActivePage("search")}
          >
            <span className="mobile-nav-icon">🔍</span>
            <span>Search</span>
          </button>
          <button 
            className={`mobile-nav-item ${activePage === "mood" ? "active" : ""}`}
            onClick={() => setActivePage("mood")}
          >
            <span className="mobile-nav-icon">🧠</span>
            <span>Mood</span>
          </button>
        </nav>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </>
  );
}