import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.development")
django.setup()

from recommendr.models import Language, MediaAge, Mood, Occasion, Rating

# 2. Define Lists
languages = [
    "Any",
    "English",
    "Bengali",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Arabic",
    "Korean",
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Mandarin",
    "Italian",
    "Portuguese",
    "Russian",
    "Turkish",
]

media_ages = [
    "Doesn’t Matter",
    "Released Before 2000",
    "Released Between 2000-2009",
    "Released Between 2010-2014",
    "Released Between 2015-2019",
    "Released After 2020",
    "Released in the Last 5 Years",
]

moods = [
    "Happy",
    "Neutral",
    "Sad",
    "Excited",
    "Romantic",
    "Anxious",
    "Adventurous",
    "Melancholic",
    "Motivated",
    "Relaxed",
    "Tired",
]

occasions = [
    "Just by Myself",
    "With Friends",
    "With Family",
    "Date Night",
    "Party Time",
    "Weekend Chill",
    "Holiday Gathering",
    "Road Trip",
    "Study Session",
    "Workout Session",
    "Relaxing at Home",
]

ratings = [
    "Doesn’t Matter",
    "Good Rated Titles",
    "Award-Winning Titles",
    "Critically Acclaimed Titles",
    "Popular Titles",
    "Cult Classics",
    "Underrated Gems",
    "Box Office Hits",
]


def seed_languages():
    for lang in languages:
        obj, created = Language.objects.get_or_create(title=lang)
        if created:
            print(f"✅ Created Language: {lang}")
        else:
            print(f"⚠️ Language already exists: {lang}")


def seed_media_ages():
    for age in media_ages:
        obj, created = MediaAge.objects.get_or_create(title=age)
        if created:
            print(f"✅ Created MediaAge: {age}")
        else:
            print(f"⚠️ MediaAge already exists: {age}")


def seed_moods():
    for mood in moods:
        obj, created = Mood.objects.get_or_create(title=mood)
        if created:
            print(f"✅ Created Mood: {mood}")
        else:
            print(f"⚠️ Mood already exists: {mood}")


def seed_occasions():
    for occasion in occasions:
        obj, created = Occasion.objects.get_or_create(title=occasion)
        if created:
            print(f"✅ Created Occasion: {occasion}")
        else:
            print(f"⚠️ Occasion already exists: {occasion}")


def seed_ratings():
    for rating in ratings:
        obj, created = Rating.objects.get_or_create(title=rating)
        if created:
            print(f"✅ Created Rating: {rating}")
        else:
            print(f"⚠️ Rating already exists: {rating}")


def run_all():
    seed_languages()
    seed_media_ages()
    seed_moods()
    seed_occasions()
    seed_ratings()
    print("\n🎉 Done seeding Languages, MediaAges, Moods, Occasions, and Ratings!")


if __name__ == "__main__":
    run_all()
