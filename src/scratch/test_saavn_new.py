import urllib.request
import urllib.parse
import json

def test_saavn_new(query):
    print(f"\n--- Testing saavn new for: {query} ---")
    instance = "https://jiosaavn-api-beta-three.vercel.app"
    try:
        search_query = urllib.parse.quote(query)
        search_url = f"{instance}/api/search/songs?query={search_query}"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            if data.get('data', {}).get('results'):
                track = data['data']['results'][0]
                print(f"  Found track: {track.get('name')}")
                download_urls = track.get('downloadUrl')
                if download_urls:
                    link = download_urls[-1]['link']
                    print(f"  ✅ SUCCESS: {link[:100]}...")
                    return True
    except Exception as e:
        print(f"  ❌ Failed: {e}")
    return False

test_saavn_new("Kesariya")
