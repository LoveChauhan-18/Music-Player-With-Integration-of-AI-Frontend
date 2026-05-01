// src/services/musicApi.js - Updated 2026-04-26
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
      // Store the REAL duration from iTunes metadata (in seconds)
      duration: Math.floor((track.trackTimeMillis || 30000) / 1000),
      genre: track.primaryGenreName || "Music",
      artwork: track.artworkUrl100?.replace("100x100", "300x300") || null,
      artworkSmall: track.artworkUrl100 || null,
      // previewUrl is the 30-sec iTunes preview; full audio is resolved via yt-dlp
      previewUrl: track.previewUrl,
      year: track.releaseDate
        ? new Date(track.releaseDate).getFullYear()
        : 2024,
      plays: Math.floor(Math.random() * 500000) + 50000,
      emoji: null, // We use artwork instead
      color: "#8b5cf6",
      mood: ["happy", "energetic"],
      source: "itunes",
      // Flag: always resolve to full audio via backend yt-dlp on play
      needsFullAudio: true,
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

/**
 * Fetches mood-specific songs across all global regions (India, US, Korea, Japan)
 * and merges them into one massive multi-cultural recommendation set.
 */
export async function fetchGlobalMoodSongs(moodLabel, limit = 40) {
  try {
    const results = await Promise.all([
      fetchITunes(`${moodLabel} bollywood hindi`, limit, "in"),
      fetchITunes(`${moodLabel} pop hollywood hits`, limit, "us"),
      fetchITunes(`${moodLabel} kpop hits`, limit, "kr"),
      fetchITunes(`${moodLabel} jpop anime hits`, limit, "jp"),
    ]);
    return dedupe(results.flat());
  } catch (e) {
    console.error("Global mood fetch error:", e);
    return [];
  }
}

export async function searchMusic(query, limit = 50) {
  try {
    return await fetchITunes(query, limit, "us");
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

// ── Django Backend Integration ──────────────────────────────────────────

const BASE_API_URL = process.env.NODE_ENV === 'production' 
  ? "https://love-music-backend.onrender.com/api" 
  : "http://localhost:8000/api";

const LOCAL_API_URL = `${BASE_API_URL}/songs/`;

export async function fetchLocalLibrary() {
  try {
    const res = await fetch(LOCAL_API_URL);
    if (!res.ok) throw new Error("Local API unreachable");
    const data = await res.json();
    const normalized = data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist?.name || "Unknown Artist",
      album: track.album || "Local Album",
      // Let the audio element determine the real duration — do NOT hardcode 30
      duration: track.duration || null,
      genre: track.genre || "Music",
      artwork: track.artwork_url,
      // Use audio_file (full song) preferentially; fall back to preview_url
      previewUrl: track.audio_file || track.preview_url,
      year: 2026,
      plays: track.plays || 0,
      emoji: "🎵",
      color: "#10b981",
      source: "local",
    }));
    return dedupe(normalized);
  } catch (e) {
    console.error("Local Library fetch error:", e);
    return [];
  }
}

/**
 * Triggers the Django backend to sync the latest global hits from iTunes
 * into the local database automatically.
 */
export async function syncLatestWithBackend() {
  try {
    const res = await fetch(`${BASE_API_URL}/songs/sync/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Sync failed");
    return await res.json();
  } catch (e) {
    console.error("Auto-sync error:", e);
    throw e;
  }
}

export async function fetchPodcasts() {
  try {
    const res = await fetch(`${BASE_API_URL}/podcasts/`);
    if (!res.ok) throw new Error("Podcasts API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Podcasts fetch error:", e);
    return [];
  }
}

export async function fetchCartoons() {
  try {
    const res = await fetch(`${BASE_API_URL}/cartoons/`);
    if (!res.ok) throw new Error("Cartoons API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Cartoons fetch error:", e);
    return [];
  }
}

export async function fetchAnime() {
  try {
    const res = await fetch(`${BASE_API_URL}/anime/`);
    if (!res.ok) throw new Error("Anime API unreachable");
    return await res.json();
  } catch (e) {
    console.error("Anime fetch error:", e);
    return [];
  }
}

export async function resolveFullAudio(title, artist) {
  console.log(`🌐 Requesting full audio for: ${artist} - ${title}`);
  try {
    const res = await fetch(`${BASE_API_URL}/songs/resolve-audio/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist }),
    });
    if (!res.ok) {
      console.warn(`❌ Backend resolution HTTP error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data.audio_url) {
      console.log(`✅ Received full audio URL: ${data.audio_url.substring(0, 50)}...`);
      return data.audio_url;
    }
    console.warn("⚠️ Backend returned no audio_url", data);
    return null;
  } catch (e) {
    console.error("❌ Full audio resolution fetch error:", e);
    return null;
  }
}

/**
 * Fetches available AI voices from ElevenLabs (via backend)
 */
export async function fetchAIVoices() {
  try {
    const res = await fetch(`${BASE_API_URL}/ai/voices/`);
    if (!res.ok) throw new Error("Voices API unreachable");
    const data = await res.json();
    return data.voices || data; // Handle different API response structures
  } catch (e) {
    console.error("AI Voices fetch error:", e);
    return [];
  }
}

/**
 * Generates an AI vocal track for given text and voice
 */
export async function generateAIVocal(text, voiceId) {
  try {
    const res = await fetch(`${BASE_API_URL}/ai/generate-vocal/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });
    if (!res.ok) throw new Error("Vocal generation failed");
    return await res.json();
  } catch (e) {
    console.error("Vocal generation error:", e);
    throw e;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function dedupe(arr) {
  const seenIds = new Set();
  const seenNames = new Set();
  return arr.filter((item) => {
    // Dedupe by ID
    if (item.id && seenIds.has(item.id)) return false;
    if (item.id) seenIds.add(item.id);

    // Dedupe by Title + Artist (Semantic)
    const semanticKey = `${item.title?.toLowerCase()}|${item.artist?.toLowerCase()}`;
    if (seenNames.has(semanticKey)) return false;
    seenNames.add(semanticKey);

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
