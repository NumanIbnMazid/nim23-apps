import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.development")
django.setup()

from recommendr.models import MediaType, Genre, Category

# 2. Define Media Types, Genres, and Categories
media_types_data = {
    "Movie": {
        "genres": [
            "Action",
            "Adventure",
            "Comedy",
            "Drama",
            "Horror",
            "Thriller",
            "Science Fiction",
            "Fantasy",
            "Mystery",
            "Animation",
            "Romance",
            "Crime",
        ],
        "categories": [
            "Movies Based on a True Story",
            "Oscar-Winning Movies",
            "Family-Friendly Movies",
            "Critically Acclaimed Movies",
            "Feel-Good Movies",
            "Cult Classic Movies",
            "Independent Films",
            "Life-Changing Movies",
            "Must-Watch Classics",
            "Space-Themed Movies",
            "Movies Based On Books",
            "Must Be Appropriate For All Ages",
            "Only Above 13+",
            "Only Above 16+",
            "Only Above 18+",
            "For Kids",
        ],
    },
    "TV Show": {
        "genres": [
            "Drama",
            "Sitcom",
            "Reality",
            "Crime",
            "Mystery",
            "Science Fiction",
            "Fantasy",
            "Thriller",
            "Documentary",
            "Talk Show",
            "Game Show",
        ],
        "categories": [
            "Binge-Worthy TV Shows",
            "Award-Winning TV Shows",
            "Reality Competitions",
            "Classic TV Shows",
            "Crime & Investigation Shows",
            "Family TV Shows",
            "Trending TV Shows",
        ],
    },
    "Web Series": {
        "genres": [
            "Drama",
            "Comedy",
            "Thriller",
            "Horror",
            "Romance",
            "Science Fiction",
            "Fantasy",
            "Mystery",
            "Action",
        ],
        "categories": [
            "Must-Watch Web Series",
            "Critically Acclaimed Web Series",
            "Short-Format Web Series",
            "Romantic Web Series",
            "Thrilling Web Series",
            "Independent Web Series",
        ],
    },
    "Music": {
        "genres": [
            "Pop",
            "Rock",
            "Hip-Hop",
            "Jazz",
            "Classical",
            "Country",
            "Electronic",
            "R&B",
            "Reggae",
            "Blues",
            "Metal",
        ],
        "categories": [
            "Top Charting Hits",
            "Relaxing Instrumentals",
            "Workout Playlists",
            "Lo-Fi Beats",
            "Romantic Songs",
            "Party Anthems",
            "Classical Masterpieces",
            "Acoustic Sessions",
            "Road Trip Vibes",
            "Mood Lifters",
            "Upbeat Morning Tunes",
            "Rainy Day Music",
            "Folk Favorites",
            "Metal Anthems",
            "Vocal Powerhouse",
            "Instrumental Only",
        ],
    },
    "Documentary": {
        "genres": [
            "Nature",
            "History",
            "Science",
            "Biography",
            "Crime",
            "Political",
            "Cultural",
            "Sports",
            "Travel",
            "True Crime",
        ],
        "categories": [
            "Eye-Opening Documentaries",
            "Biographical Documentaries",
            "Political Documentaries",
            "Travel and Exploration Documentaries",
            "Environmental Documentaries",
            "Historical Documentaries",
            "Sports Documentaries",
        ],
    },
}


def seed_data():
    for media_type_title, contents in media_types_data.items():
        genres = contents.get("genres", [])
        categories = contents.get("categories", [])

        media_type_obj, created = MediaType.objects.get_or_create(
            title=media_type_title,
        )
        if created:
            print(f"✅ Created MediaType: {media_type_title}")
        else:
            print(f"⚠️ MediaType already exists: {media_type_title}")

        # Genres
        for genre_title in genres:
            genre_obj, genre_created = Genre.objects.get_or_create(
                title=genre_title,
                media_type=media_type_obj,
            )
            if genre_created:
                print(f"➡️ Created Genre: {genre_title} under {media_type_title}")
            else:
                print(f"⚠️ Genre already exists: {genre_title} under {media_type_title}")

        # Categories
        for category_title in categories:
            category_obj, category_created = Category.objects.get_or_create(
                title=category_title,
                media_type=media_type_obj,
            )
            if category_created:
                print(f"➡️ Created Category: {category_title} under {media_type_title}")
            else:
                print(
                    f"⚠️ Category already exists: {category_title} under {media_type_title}"
                )

    print("\n🎉 Done seeding MediaTypes, Genres, and Categories!")


if __name__ == "__main__":
    seed_data()
