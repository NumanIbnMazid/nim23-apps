import requests


def fetch_youtube_metadata(url):
    oembed_url = "https://www.youtube.com/oembed"
    params = {"url": url, "format": "json"}
    response = requests.get(oembed_url, params=params)
    return response.json()


print(
    fetch_youtube_metadata(
        "https://www.youtube.com/watch?v=tNGIgjR_RfY&ab_channel=DevGoutamMusicExpress"
    )
)

json_data = {
    "title": "Amar haat bandhibi || Dev goutam.",
    "author_name": "Dev Goutam Music Express ",
    "author_url": "https://www.youtube.com/@devgoutammus",
    "type": "video",
    "height": 113,
    "width": 200,
    "version": "1.0",
    "provider_name": "YouTube",
    "provider_url": "https://www.youtube.com/",
    "thumbnail_height": 360,
    "thumbnail_width": 480,
    "thumbnail_url": "https://i.ytimg.com/vi/tNGIgjR_RfY/hqdefault.jpg",
    "html": '<iframe width="200" height="113" src="https://www.youtube.com/embed/tNGIgjR_RfY?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Amar haat bandhibi || Dev goutam."></iframe>',
}
