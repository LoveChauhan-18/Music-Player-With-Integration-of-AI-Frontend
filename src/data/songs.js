// data/songs.js - Sample song data for the music player

export const SONGS = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "Synthwave Collective",
    album: "Electric Horizons",
    duration: 215,
    genre: "Electronic",
    mood: ["energetic", "focused", "party"],
    emoji: "🎵",
    color: "#8b5cf6",
    year: 2024,
    plays: 124500,
  },
  {
    id: 2,
    title: "Midnight Bloom",
    artist: "Luna Waves",
    album: "Soft Glow",
    duration: 198,
    genre: "Chillwave",
    mood: ["calm", "romantic", "chill"],
    emoji: "🌙",
    color: "#06b6d4",
    year: 2024,
    plays: 98200,
  },
  {
    id: 3,
    title: "Solar Flare",
    artist: "Nova Pulse",
    album: "Cosmic Beats",
    duration: 187,
    genre: "EDM",
    mood: ["energetic", "happy", "party"],
    emoji: "☀️",
    color: "#f59e0b",
    year: 2023,
    plays: 201000,
  },
  {
    id: 4,
    title: "Rain on Glass",
    artist: "Echo Chamber",
    album: "Melancholia",
    duration: 241,
    genre: "Ambient",
    mood: ["sad", "calm", "chill"],
    emoji: "🌧️",
    color: "#60a5fa",
    year: 2024,
    plays: 76300,
  },
  {
    id: 5,
    title: "Heart on Fire",
    artist: "Crimson Echo",
    album: "Burning Bright",
    duration: 203,
    genre: "Pop",
    mood: ["romantic", "happy", "energetic"],
    emoji: "❤️‍🔥",
    color: "#f43f5e",
    year: 2024,
    plays: 312000,
  },
  {
    id: 6,
    title: "Deep Focus",
    artist: "MindState",
    album: "Flow Zone",
    duration: 360,
    genre: "Lo-fi",
    mood: ["focused", "calm", "chill"],
    emoji: "🧠",
    color: "#10b981",
    year: 2023,
    plays: 445000,
  },
  {
    id: 7,
    title: "Dance Till Dawn",
    artist: "Aurora Beats",
    album: "All Night Long",
    duration: 195,
    genre: "Dance",
    mood: ["party", "energetic", "happy"],
    emoji: "🕺",
    color: "#ec4899",
    year: 2024,
    plays: 268000,
  },
  {
    id: 8,
    title: "Velvet Skies",
    artist: "Hazy Horizon",
    album: "Golden Hour",
    duration: 228,
    genre: "Soul",
    mood: ["romantic", "sad", "chill"],
    emoji: "🌅",
    color: "#f97316",
    year: 2023,
    plays: 89500,
  },
  {
    id: 9,
    title: "City Lights",
    artist: "Urban Drift",
    album: "Metropolitan",
    duration: 214,
    genre: "Hip-hop",
    mood: ["energetic", "focused", "happy"],
    emoji: "🏙️",
    color: "#a78bfa",
    year: 2024,
    plays: 178000,
  },
  {
    id: 10,
    title: "Ocean Breath",
    artist: "Tidal Flow",
    album: "Deep Blue",
    duration: 312,
    genre: "Ambient",
    mood: ["calm", "sad", "chill"],
    emoji: "🌊",
    color: "#0891b2",
    year: 2023,
    plays: 134000,
  },
  {
    id: 11,
    title: "Spark & Ember",
    artist: "Wildfire",
    album: "Ignition",
    duration: 178,
    genre: "Rock",
    mood: ["energetic", "party", "happy"],
    emoji: "🔥",
    color: "#ef4444",
    year: 2024,
    plays: 221000,
  },
  {
    id: 12,
    title: "Soft Thunder",
    artist: "Storm Poet",
    album: "Weather Patterns",
    duration: 265,
    genre: "Indie",
    mood: ["sad", "focused", "chill"],
    emoji: "⛈️",
    color: "#6366f1",
    year: 2023,
    plays: 67800,
  },
];

export const PLAYLISTS = [
  {
    id: 1,
    name: "My Favorites",
    description: "Songs I love",
    emoji: "❤️",
    songs: [1, 3, 5, 7, 9],
    color: "#f43f5e",
    createdBy: "You",
  },
  {
    id: 2,
    name: "Workout Mix",
    description: "High energy tracks",
    emoji: "💪",
    songs: [3, 7, 11, 1, 9],
    color: "#f97316",
    createdBy: "You",
  },
  {
    id: 3,
    name: "Chill Vibes",
    description: "Relaxing music",
    emoji: "🌊",
    songs: [2, 4, 6, 8, 10],
    color: "#06b6d4",
    createdBy: "You",
  },
  {
    id: 4,
    name: "Late Night Focus",
    description: "Deep concentration",
    emoji: "🌙",
    songs: [6, 4, 10, 12, 2],
    color: "#8b5cf6",
    createdBy: "You",
  },
];

export const MOODS = [
  { id: "happy",     emoji: "😊", label: "Happy",     color: "#f59e0b", description: "Upbeat & joyful vibes" },
  { id: "sad",       emoji: "😢", label: "Sad",       color: "#60a5fa", description: "Melancholic & reflective" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#f97316", description: "High intensity & pumped" },
  { id: "calm",      emoji: "😌", label: "Calm",      color: "#10b981", description: "Peaceful & serene" },
  { id: "romantic",  emoji: "💕", label: "Romantic",  color: "#f43f5e", description: "Love & tender feelings" },
  { id: "focused",   emoji: "🎯", label: "Focused",   color: "#8b5cf6", description: "In the zone & productive" },
  { id: "party",     emoji: "🎉", label: "Party",     color: "#ec4899", description: "Dance & celebration mode" },
  { id: "chill",     emoji: "🧊", label: "Chill",     color: "#06b6d4", description: "Relaxed & easygoing" },
];

export const VOICE_TYPES = [
  "Male Tenor", "Male Baritone", "Male Bass",
  "Female Soprano", "Female Alto", "Female Mezzo-Soprano",
  "Androgynous", "Raspy", "Smooth R&B", "Electronic/Vocoder"
];

export const GENRES = [
  "Pop", "Hip-hop", "R&B", "Electronic", "EDM", "Lo-fi",
  "Ambient", "Chillwave", "Rock", "Indie", "Jazz", "Classical",
  "Dance", "Soul", "Funk", "Synthwave"
];

export const AI_MOOD_RESPONSES = {
  happy: "🎵 I sense some joyful energy! Here's a sunny, feel-good mix curated just for your happy mood. These tracks will keep those good vibes flowing! ✨",
  sad: "🎵 It's okay to feel what you feel. I've selected some deeply beautiful, emotionally resonant tracks to accompany you through this moment. 💙",
  energetic: "🎵 Let's GO! I've assembled the ultimate high-energy playlist to fuel your fire. Time to crush it! ⚡",
  calm: "🎵 Taking it easy? Perfect. I've handpicked some wonderfully peaceful and serene tracks to help you unwind and breathe. 🌿",
  romantic: "🎵 Feeling the love? I've curated a tender, heartfelt collection of songs perfect for romantic moments and warm feelings. 💕",
  focused: "🎵 Ready to get in the zone? I've selected tracks scientifically designed to maximize your focus and creative flow. 🎯",
  party: "🎵 LET'S PARTY! The ultimate banger playlist has arrived. Get ready to dance like nobody's watching! 🎉",
  chill: "🎵 Keeping it smooth and easy. I've put together the most perfectly chill tracks for a laid-back session. 🧊",
};

export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatPlays = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};
