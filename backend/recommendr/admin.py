from django.contrib import admin
from recommendr.models import (
    RecommendrUtils,
    MediaType,
    Mood,
    Language,
    Genre,
    Occasion,
    MediaAge,
    Rating,
    Category,
)

# ----------------------------------------------------
# *** RecommendrUtils ***
# ----------------------------------------------------


@admin.register(RecommendrUtils)
class RecommendrUtilsAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "system_prompt", "created_at", "updated_at")

    def has_add_permission(self, request):
        # Prevent adding new entries if one already exists
        if RecommendrUtils.objects.count() >= 1:
            return False
        return super().has_add_permission(request)


# ----------------------------------------------------
# *** MediaType ***
# ----------------------------------------------------


@admin.register(MediaType)
class MediaTypeAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Mood ***
# ----------------------------------------------------
@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Language ***
# ----------------------------------------------------
@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Genre ***
# ----------------------------------------------------
@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "media_type", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Occasion ***
# ----------------------------------------------------
@admin.register(Occasion)
class OccasionAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** MediaAge ***
# ----------------------------------------------------
@admin.register(MediaAge)
class MediaAgeAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Rating ***
# ----------------------------------------------------
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}


# ----------------------------------------------------
# *** Category ***
# ----------------------------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "media_type", "order", "created_at", "updated_at")
    ordering = ("-order", "-created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("title",)}
