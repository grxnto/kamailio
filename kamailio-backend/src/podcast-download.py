import os
from pathlib import Path
import requests # For API calling
import time
import hashlib
import json
from dotenv import load_dotenv # load .env for podcast index API

# load the environment
load_dotenv()
API_KEY = os.getenv("PODCAST_INDEX_KEY")
API_SECRET = os.getenv("PODCAST_INDEX_SECRET")
BASE_URL = "https://api.podcastindex.org/api/1.0"

# access the data folder outside of src
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data/podcasts-eng"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)


# for API authentication
def make_headers():
    """
    Generate the authentication headers required 
    by the Podcast Index API.
    """
    now = int(time.time())
    auth_string = API_KEY + API_SECRET + str(now)
    auth_hash = hashlib.sha1(auth_string.encode("utf-8")).hexdigest()
    return {
        "User-Agent": "PodcastFetcher/1.0",
        "X-Auth-Date": str(now),
        "X-Auth-Key": API_KEY,
        "Authorization": auth_hash,
    }

# Query the API for episodes
def search_episodes(term="news", min_duration=0, max_duration=600, max_feeds=2, max_episodes_per_feed=5):
    """
    Search Podcast Index for episodes matching a term and duration range.
    
    Args:
        term (str): Keyword to search in podcast titles/feeds.
        min_duration (int): Minimum duration of episode in seconds.
        max_duration (int): Maximum duration of episode in seconds.
        max_feeds (int): How many entire shows to search.
        max_episodes_per_feed (int): How many episodes to fetch per feed.
    
    Returns:
        List of dicts: Each dict contains 'title', 'audio_url', 'duration', 'feed_title'
    """
    headers = make_headers()
    url = f"{BASE_URL}/search/byterm?q={term}" # search for term
    res = requests.get(url, headers=headers)
    feeds = res.json().get("feeds", [])
    print(f"Found {len(feeds)} feeds for term '{term}'")

    episodes_list = []

    for feed in feeds[:max_feeds]:
        # find a show
        feed_id = feed.get("id")
        feed_title = feed.get("title", "Unknown")
        if not feed_id or feed_title == "Unknown":
            continue

        # retrieve episode url
        episodes_url = f"{BASE_URL}/episodes/byfeedid?id={feed_id}"
        r = requests.get(episodes_url, headers=headers) # request API
        episodes = r.json().get("items", [])[:max_episodes_per_feed]

        for ep in episodes:
            duration = ep.get("duration") or 0
            audio_url = ep.get("enclosureUrl")
            if audio_url and min_duration <= duration <= max_duration:
                episodes_list.append({
                    "feed_title": feed_title,
                    "title": ep.get("title", "Untitled Episode"),
                    "audio_url": audio_url,
                    "duration": duration,
                    "pub_date": ep.get("datePublished")
                })

    print(f"Found {len(episodes_list)} episodes matching criteria.")
    return episodes_list

def download_audio(episodes):
    """
    Download episodes into data/raw directory.
    """
    for ep in episodes:
        # Limit to 50 chars
        title = ep["title"].replace("/", "_").replace(" ", "_")[:50]
        filename = f"{title}.mp3"
        filepath = RAW_DATA_DIR / filename

        # don't download if it exists already
        if filepath.exists():
            print(f"Already downloaded: {filename}")
            continue

        print(f"Downloading: {ep['title']} ({ep['duration']}s)")
        try:
            with requests.get(ep["audio_url"], stream=True, timeout=10) as r:
                r.raise_for_status()
                with open(filepath, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            print(f"Saved to {filepath}")
        except Exception as e:
            print(f"Failed to download {ep['title']}: {e}")



def main():
    episodes = search_episodes(term="news")
    download_audio(episodes)

if __name__ == "__main__":
    main()
