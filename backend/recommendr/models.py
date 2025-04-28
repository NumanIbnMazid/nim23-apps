from django.db import models
from utils.snippets import autoSlugFromUUID, autoslugFromField
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db.models.signals import pre_save
from django.dispatch import receiver
from utils.helpers import assign_order


""" *************** Recommendr Utils *************** """


@autoSlugFromUUID()
class RecommendrUtils(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    system_prompt = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recommendr_utils"
        verbose_name = _("Recommendr Utils")
        verbose_name_plural = _("Recommendr Utils")
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.title}"

    def clean(self):
        if RecommendrUtils.objects.exclude(pk=self.pk).exists():
            raise ValidationError("Only one RecommendrUtils instance is allowed.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Triggers the `clean` method above
        super().save(*args, **kwargs)


""" *************** Media Type *************** """


@autoslugFromField("title")
class MediaType(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "media_type"
        verbose_name = _("Media Type")
        verbose_name_plural = _("Media Types")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals


@receiver(pre_save, sender=MediaType)
def media_type_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for MediaType instances.
    """
    assign_order(instance, MediaType)


""" *************** Mood *************** """


@autoslugFromField("title")
class Mood(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "mood"
        verbose_name = _("Mood")
        verbose_name_plural = _("Moods")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Mood)
def mood_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Mood instances.
    """
    assign_order(instance, Mood)


""" *************** Language *************** """


@autoslugFromField("title")
class Language(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "language"
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Language)
def language_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Language instances.
    """
    assign_order(instance, Language)


""" *************** Genre *************** """


@autoslugFromField("title")
class Genre(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    media_type = models.ForeignKey(
        MediaType,
        related_name="genres",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "genre"
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Genre)
def genre_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Genre instances.
    """
    assign_order(instance, Genre)


""" *************** Occasion *************** """


@autoslugFromField("title")
class Occasion(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "occasion"
        verbose_name = _("Occasion")
        verbose_name_plural = _("Occasions")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Occasion)
def occasion_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Occasion instances.
    """
    assign_order(instance, Occasion)


""" *************** Media Age *************** """


@autoslugFromField("title")
class MediaAge(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "media_age"
        verbose_name = _("Media Age")
        verbose_name_plural = _("Media Ages")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=MediaAge)
def media_age_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for MediaAge instances.
    """
    assign_order(instance, MediaAge)


""" *************** Rating *************** """


@autoslugFromField("title")
class Rating(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "rating"
        verbose_name = _("Rating")
        verbose_name_plural = _("Ratings")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Rating)
def rating_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Rating instances.
    """
    assign_order(instance, Rating)


""" *************** Categories *************** """


@autoslugFromField("title")
class Category(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    media_type = models.ForeignKey(
        MediaType,
        related_name="categories",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    order = models.PositiveIntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "category"
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ("-order", "-created_at")

    def __str__(self):
        return f"{self.title}"


# Signals
@receiver(pre_save, sender=Category)
def category_pre_save(sender, instance, **kwargs):
    """
    Signal to automatically assign order for Category instances.
    """
    assign_order(instance, Category)
