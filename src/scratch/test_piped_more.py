import urllib.request
import urllib.parse
import json
import ssl

def test_piped_list(query):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    piped_instances = [
        "https://pipedapi.ducks.party",
        "https://pipedapi.us.to",
        "https://pipedapi.oxitane.it",
        "https://api.piped.privacydev.net",
        "https://pipedapi.synced.cloud",
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
                    video_id = url.split('=')[-1] if '=' in url else url.split('/')[-1]
                    
                    if video_id:
                        stream_url = f"{instance}/streams/{video_id}"
                        with urllib.request.urlopen(stream_url, timeout=10, context=ctx) as stream_resp:
                            stream_data = json.loads(stream_resp.read().decode())
                            audio_streams = stream_data.get('audioStreams', [])
                            if audio_streams:
                                print(f"  ✅ SUCCESS: {audio_streams[0]['url'][:50]}...")
                                return True
        except Exception as e:
            print(f"  ⚠️ Failed: {e}")
    return False

test_piped_list("Kesariya")
