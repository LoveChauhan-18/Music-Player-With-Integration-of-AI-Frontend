// data/songs.js - Sample song data for the music player

export const SONGS = [];

export const PLAYLISTS = [
  {
    id: 1,
    name: "My Favorites",
    description: "Songs I love",
    emoji: "❤️",
    songs: [],
    color: "#f43f5e",
    createdBy: "You",
  },
  {
    id: 2,
    name: "Workout Mix",
    description: "High energy tracks",
    emoji: "💪",
    songs: [],
    color: "#f97316",
    createdBy: "You",
  },
  {
    id: 3,
    name: "Chill Vibes",
    description: "Relaxing music",
    emoji: "🌊",
    songs: [],
    color: "#06b6d4",
    createdBy: "You",
  },
  {
    id: 4,
    name: "Late Night Focus",
    description: "Deep concentration",
    emoji: "🌙",
    songs: [],
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
  happy: "🎵 I sense some joyful energy! Here are some sunny, feel-good songs that match your happy vibe. These tracks will keep the positive energy flowing! ✨",
  sad: "🎵 It's okay to feel what you feel. I've found some deeply beautiful, emotionally resonant songs to accompany you through this moment. 💙",
  energetic: "🎵 Let's GO! I've found these high-energy songs to fuel your fire. Time to crush it! ⚡",
  calm: "🎵 Taking it easy? Perfect. I've handpicked some wonderfully peaceful and serene songs to help you unwind and breathe. 🌿",
  romantic: "🎵 Feeling the love? I've found these tender, heartfelt songs perfect for romantic moments and warm feelings. 💕",
  focused: "🎵 Ready to get in the zone? I've selected songs designed to maximize your focus and creative flow. 🎯",
  party: "🎵 LET'S PARTY! These banger songs are exactly what you need. Get ready to dance! 🎉",
  chill: "🎵 Keeping it smooth and easy. I've found the perfect chill songs for a laid-back session. 🧊",
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
