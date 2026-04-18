// src/services/musicApi.js
// Uses the iTunes Search API - free, no key required, supports CORS

const BASE_URL = "https://itunes.apple.com/search";

/**
 * Fetch songs from iTunes by search term
 * Returns normalized song objects with previewUrl for real audio playback
 */
async function fetchITunes(term, limit = 20, country = "us") {
  const url = `${BASE_URL}?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}&country=${country}&explicit=No`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
  const data = await res.json();
  return data.results
    .filter((t) => t.previewUrl) // Only songs with playable previews
    .map((track) => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName || "Single",
      duration: Math.floor((track.trackTimeMillis || 30000) / 1000),
      genre: track.primaryGenreName || "Music",
      artwork: track.artworkUrl100?.replace("100x100", "300x300") || null,
      artworkSmall: track.artworkUrl100 || null,
      previewUrl: track.previewUrl, // 30-second real audio preview
      year: track.releaseDate
        ? new Date(track.releaseDate).getFullYear()
        : 2024,
      plays: Math.floor(Math.random() * 500000) + 50000,
      emoji: null, // We use artwork instead
      color: "#8b5cf6",
      mood: ["happy", "energetic"],
      source: "itunes",
    }));
}

const CURRENT_YEAR = new Date().getFullYear();

// ── Category Fetchers ──────────────────────────────────────────────────────────

export async function fetchBollywood() {
  try {
    const results = await Promise.all([
      fetchITunes(`bollywood hindi hits ${CURRENT_YEAR}`, 100, "in"),
      fetchITunes("arijit singh latest songs", 100, "in"),
      fetchITunes("shreya ghoshal retro hits", 100, "in"),
      fetchITunes("punjabi pop hits", 100, "in"),
    ]);
    const combined = [...results[0], ...results[1], ...results[2], ...results[3]];
    return dedupe(combined).slice(0, 300);
  } catch (e) {
    console.error("Bollywood fetch error:", e);
    return [];
  }
}

export async function fetchHollywood() {
  try {
    const results = await Promise.all([
      fetchITunes(`top pop hits ${CURRENT_YEAR}`, 100, "us"),
      fetchITunes(`billboard hot 100 ${CURRENT_YEAR}`, 100, "us"),
      fetchITunes("hip hop trending", 100, "us"),
      fetchITunes("classic rock anthems", 100, "us"),
    ]);
    const combined = [...results[0], ...results[1], ...results[2], ...results[3]];
    return dedupe(combined).slice(0, 300);
  } catch (e) {
    console.error("Hollywood fetch error:", e);
    return [];
  }
}

export async function fetchKorean() {
  try {
    const results = await Promise.all([
      fetchITunes(`kpop hits ${CURRENT_YEAR}`, 100, "us"),
      fetchITunes("BTS blackpink new jeans aespa latest", 100, "us"),
      fetchITunes("korean r&b indie hits", 100, "us"),
      fetchITunes("stray kids twice txt", 100, "us"),
    ]);
    const combined = [...results[0], ...results[1], ...results[2], ...results[3]];
    return dedupe(combined).slice(0, 300);
  } catch (e) {
    console.error("K-Pop fetch error:", e);
    return [];
  }
}

export async function fetchJapanese() {
  try {
    const results = await Promise.all([
      fetchITunes(`jpop trending anime ${CURRENT_YEAR}`, 100, "jp"),
      fetchITunes("japanese pop music hits", 100, "jp"),
      fetchITunes("city pop classic japan", 100, "jp"),
      fetchITunes("vocaloid covers utaite", 100, "jp"),
    ]);
    const combined = [...results[0], ...results[1], ...results[2], ...results[3]];
    return dedupe(combined).slice(0, 300);
  } catch (e) {
    console.error("J-Pop fetch error:", e);
    return [];
  }
}

export async function fetchLatestGlobal() {
  try {
    const results = await Promise.all([
      fetchITunes("new hindi release", 5, "in"),
      fetchITunes("new pop releases", 5, "us"),
      fetchITunes("new kpop release", 5, "kr"),
      fetchITunes("new jpop release", 5, "jp"),
    ]);
    const combined = results.flat();
    return dedupe(combined).sort(() => 0.5 - Math.random()).slice(0, 10);
  } catch (e) {
    console.error("Latest global fetch error:", e);
    return [];
  }
}

export async function searchMusic(query, limit = 20) {
  try {
    return await fetchITunes(query, limit, "us");
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

// ── Django Backend Integration ──────────────────────────────────────────

const LOCAL_API_URL = "https://love-music-backend.onrender.com/api/songs/";

export async function fetchLocalLibrary() {
  try {
    const res = await fetch(LOCAL_API_URL);
    if (!res.ok) throw new Error("Local API unreachable");
    const data = await res.json();
    return data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist?.name || "Unknown Artist",
      album: track.album || "Local Album",
      duration: 30, // Preview length
      genre: track.genre || "Music",
      artwork: track.artwork_url,
      previewUrl: track.preview_url || track.audio_file,
      year: 2026,
      plays: track.plays || 0,
      emoji: "🎵",
      color: "#10b981",
      source: "local",
    }));
  } catch (e) {
    console.error("Local Library fetch error:", e);
    return [];
  }
}

export async function fetchPodcasts() {
  try {
    const res = await fetch("https://love-music-backend.onrender.com/api/podcasts/");
    if (!res.ok) throw new Error("Podcasts API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Podcasts fetch error:", e);
    return [];
  }
}

export async function fetchCartoons() {
  try {
    const res = await fetch("https://love-music-backend.onrender.com/api/cartoons/");
    if (!res.ok) throw new Error("Cartoons API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Cartoons fetch error:", e);
    return [];
  }
}

export async function fetchAnime() {
  try {
    const res = await fetch("https://love-music-backend.onrender.com/api/anime/");
    if (!res.ok) throw new Error("Anime API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Anime fetch error:", e);
    return [];
  }
}

export async function resolveFullAudio(title, artist) {
  try {
    const res = await fetch("https://love-music-backend.onrender.com/api/songs/resolve-audio/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist }),
    });
    if (!res.ok) throw new Error("Audio resolution failed");
    const data = await res.json();
    return data.audio_url;
  } catch (e) {
    console.error("Full audio resolution error:", e);
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function dedupe(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export const EXPLORE_CATEGORIES = [
  {
    id: "bollywood",
    label: "🎬 Bollywood",
    shortLabel: "Bollywood",
    flag: "🇮🇳",
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
    description: "Latest Hindi film & pop music",
    fetcher: fetchBollywood,
  },
  {
    id: "hollywood",
    label: "🎵 Hollywood",
    shortLabel: "Hollywood",
    flag: "🇺🇸",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    description: "Top US pop, R&B & chart hits",
    fetcher: fetchHollywood,
  },
  {
    id: "korean",
    label: "💜 K-Pop",
    shortLabel: "K-Pop",
    flag: "🇰🇷",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899, #a855f7)",
    description: "Korean pop, idol groups & hits",
    fetcher: fetchKorean,
  },
  {
    id: "japanese",
    label: "🌸 J-Pop",
    shortLabel: "J-Pop",
    flag: "🇯🇵",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    description: "Japanese pop, anime & city pop",
    fetcher: fetchJapanese,
  },
];
