import yt_dlp
import logging
from utils.snippets import is_youtube_url
import os
from utils.snippets import is_youtube_url
from utils.helpers import (
    generate_ytdlp_cookies,
    yt_dlp_cookies_exists,
    get_cookies_path,
)

logger = logging.getLogger("summarizer_url_handlers")


def extract_audio_from_url(url: str) -> str:
    """
    Handles both video/audio URLs (e.g., YouTube/Facebook).
    Extracts audio stream from URL and returns audio URL.
    """
    try:
        ydl_opts = {
            "quiet": True,
            "skip_download": True,
            # Throttle settings to avoid YouTube guest rate limit
            "sleep_interval": 10,  # Always sleep at least 10 seconds between downloads
            "max_sleep_interval": 15,  # Random sleep between 10-15 seconds
            "sleep_requests": 1,  # Sleep 1 second between network requests (metadata fetches)
            # "format": "bestaudio/best",
            "format": "worstaudio",
            # "format": "bestaudio[abr<=128]/bestaudio",
            "extract_flat": False,
        }
        if is_youtube_url(url):
            # Check if cookies.txt exists
            if not yt_dlp_cookies_exists():
                # Create cookies.txt from environment variables
                generate_ytdlp_cookies()
            if os.path.exists(get_cookies_path()):
                logger.info("Cookies file found. Using cookies for authentication.")
                ydl_opts["cookiefile"] = get_cookies_path()
            else:
                raise Exception(
                    "Cookies file not found. Please refresh your credentials."
                )

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Extracting audio from URL: {url}")
            info = ydl.extract_info(url, download=False)
            audio_url = info.get("url")
            if not audio_url:
                raise ValueError(f"Audio not found in the provided URL: {url}")
            return audio_url
    except Exception as e:
        logger.error(f"Error extracting audio from URL {url}: {e}")
        raise ValueError(f"Failed to extract audio from URL: {url}")
