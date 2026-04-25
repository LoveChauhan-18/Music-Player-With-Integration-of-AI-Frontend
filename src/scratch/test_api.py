import urllib.request
import urllib.parse
import json

def test_resolve():
    query = "Mohit Chauhan Saiyaara"
    url = f"https://saavn.me/search/songs?query={urllib.parse.quote(query)}"
    print(f"Testing URL: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read())
            if data.get('status') == 'SUCCESS':
                song = data['data']['results'][0]
                print(f"Found: {song['name']} by {song['primaryArtists']}")
                for dl in song['downloadUrl']:
                    print(f"Quality: {dl['quality']} - Link: {dl['link']}")
            else:
                print("API returned failure status")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_resolve()
