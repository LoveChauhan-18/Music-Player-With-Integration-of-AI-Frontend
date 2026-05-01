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

import { SONGS } from "./data/songs";
import { authService } from "./services/authService";
import { playlistService } from "./services/playlistService";

let toastId = 0;

export default function App() {
  const [activePage, setActivePage] = useState("home");
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

  const handlePlay = useCallback(async (song, contextQueue) => {
    const { resolveFullAudio } = await import("./services/musicApi");

    if (currentSong?.id === song.id) {
      setIsPlaying((p) => !p);
    } else {
      // 1. Initial play with preview (instant)
      setCurrentSong(song);
      setIsPlaying(true);

      // 2. Update queue: use context queue if provided, otherwise add song to existing queue
      if (contextQueue && contextQueue.length > 0) {
        setQueue(contextQueue);
      } else {
        setQueue(prev => {
          if (!prev.find(s => s.id === song.id)) {
            return [...prev, song];
          }
          return prev;
        });
      }
      
      const msg = song.source === "itunes" 
        ? `🎵 Playing Preview: Resolving full audio for "${song.title}"...` 
        : `Now playing: ${song.title}`;
      showToast(msg, "info", "✨");

      // 3. Resolve Full Audio in background via yt-dlp backend
      // Triggers for: all iTunes songs (needsFullAudio flag) OR local songs missing audio
      const needsResolve = song.needsFullAudio || song.source === "itunes" || (song.source === "local" && !song.audio_file && !song.previewUrl?.includes('/media/'));
      if (needsResolve) {
        try {
          const fullAudioUrl = await resolve_with_timeout(
            resolveFullAudio(song.title, song.artist),
            60000  // 60s timeout for slower connections / cold starts
          );
          
          if (fullAudioUrl) {
            setCurrentSong(prev => {
              if (prev?.id === song.id) {
                return { ...prev, previewUrl: fullAudioUrl, isFullAudio: true, needsFullAudio: false };
              }
              return prev;
            });
            showToast(`✨ Full song loaded: "${song.title}"`, "success", "🔥");
          } else {
            // Backend couldn't resolve — keep playing the iTunes 30-sec preview
            console.warn(`Backend resolution failed for "${song.title}". Falling back to 30s preview.`);
            showToast(`⚠️ Full audio unavailable. Playing 30-sec preview for "${song.title}".`, "warning", "ℹ️");
          }
        } catch (e) {
          // Timeout or network error — keep playing preview silently
          console.warn("Full audio resolution timed out, playing preview instead.");
          showToast(`⏳ Resolution timed out. Playing preview for "${song.title}".`, "info", "⏱️");
        }
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
    const isExternal = songMetadata || !isDbSong;

    setLikedSongs((prev) => {
      const isLiked = prev.includes(songId);
      if (isLiked) {
        showToast("Removed from Liked Songs", "info", "💔");
        if (user) {
          playlistService.toggleLike(songId, songMetadata).catch(console.error);
        }
        return prev.filter((id) => id !== songId);
      } else {
        showToast("Added to Liked Songs!", "success", "❤️");
        if (user) {
          playlistService.toggleLike(songId, songMetadata).catch(console.error);
        }
        return [...prev, songId];
      }
    });
  }, [showToast, user]);

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
    setLikedSongs(likedIds);

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
            setActivePage={setActivePage}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
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
        return (
          <LikedSongsPage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={handleLike}
            likedSongs={likedSongs}
            allSongs={queue}
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
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          likedSongs={likedSongs}
          playlists={playlists}
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="app-main">
          <header className="topbar">
            <div className="topbar-nav-btns">
              <button className="btn-icon" title="Back">←</button>
              <button className="btn-icon" title="Forward">→</button>
            </div>
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input
                placeholder="Search globally with iTunes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== "search") setActivePage("search");
                }}
                onFocus={() => setActivePage("search")}
              />
            </div>
            <div className="topbar-right">
              {/* AI Badges */}
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "8px 14px" }}
                onClick={() => setActivePage("mood")}
              >
                🧠 AI Mood
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: 12, padding: "8px 14px" }}
                onClick={() => setActivePage("creator")}
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