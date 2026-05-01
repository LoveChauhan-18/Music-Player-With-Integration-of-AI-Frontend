import os
import sys
import urllib.request
import urllib.parse
import json
import ssl

def test_piped(query):
    print(f"\n--- Testing Piped for: {query} ---")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    piped_instances = [
        "https://pipedapi.kavin.rocks",
        "https://api.piped.victr.me",
        "https://pipedapi.darkness.services",
        "https://pipedapi.rivo.cc",
    ]
    
    for instance in piped_instances:
        try:
            print(f"📡 Trying Piped instance: {instance}")
            search_url = f"{instance}/search?q={urllib.parse.quote(query)}&filter=videos"
            req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
                search_data = json.loads(response.read().decode())
                if search_data.get('items'):
                    item = search_data['items'][0]
                    url = item.get('url', '')
                    print(f"  Found video URL: {url}")
                    video_id = url.split('=')[-1] if '=' in url else url.split('/')[-1]
                    print(f"  Extracted video ID: {video_id}")
                    
                    if video_id:
                        stream_url = f"{instance}/streams/{video_id}"
                        with urllib.request.urlopen(stream_url, timeout=10, context=ctx) as stream_resp:
                            stream_data = json.loads(stream_resp.read().decode())
                            audio_streams = stream_data.get('audioStreams', [])
                            if audio_streams:
                                print(f"  ✅ SUCCESS: {audio_streams[0]['url'][:100]}...")
                                return True
        except Exception as e:
            print(f"  ⚠️ Failed: {e}")
    return False

def test_saavn(query):
    print(f"\n--- Testing JioSaavn for: {query} ---")
    saavn_instances = [
        "https://saavn.me",
        "https://jiosaavn-api-v3.vercel.app",
    ]
    
    for instance in saavn_instances:
        try:
            print(f"📡 Trying Saavn instance: {instance}")
            search_url = f"{instance}/search/songs?query={urllib.parse.quote(query)}"
            req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                results = data.get('data', {}).get('results') or data.get('results')
                if results:
                    track = results[0]
                    print(f"  Found track: {track.get('name')}")
                    download_urls = track.get('downloadUrl') or track.get('download_url')
                    if download_urls:
                        link = download_urls[-1]['link'] if isinstance(download_urls[-1], dict) else download_urls[-1]
                        print(f"  ✅ SUCCESS: {link[:100]}...")
                        return True
        except Exception as e:
            print(f"  ⚠️ Failed: {e}")
    return False

query = "Kesariya"
test_piped(query)
test_saavn(query)
