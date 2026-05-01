import os
import sys

# Add project root to path
sys.path.append(r"c:\Users\lovek\OneDrive\Desktop\OJT-2 frontend\Music-Player-With-Integration-of-AI-Backend")

# Mock Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from core.utils.youtube_resolver import resolve_youtube_audio

songs = [
    "Arijit Singh - Kesariya",
    "The Weeknd - Blinding Lights",
    "Taylor Swift - Anti-Hero"
]

for song in songs:
    print(f"\n--- Testing: {song} ---")
    url = resolve_youtube_audio(song)
    if url:
        print(f"✅ SUCCESS: {url[:100]}...")
    else:
        print(f"❌ FAILED")
