import requests
import json

def get_playlist_by_link(link):
    url = "https://jiosaavnpro.vercel.app/api/playlists"
    params = {"link": link}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data", {})

    except requests.RequestException as e:
        print("Error fetching playlist:", e)
        return {}

# Use this corrected link:
if __name__ == "__main__":
    playlist_link = "https://www.jiosaavn.com/playlist/bollywood/top-50/4FCrZtZUZvN5V6NlfmGwnA__"
    playlist_data = get_playlist_by_link(playlist_link)
    print(json.dumps(playlist_data, indent=2, ensure_ascii=False))
