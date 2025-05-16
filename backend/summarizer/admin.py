from django.contrib import admin
from summarizer.models import SummarizerUtils

# ----------------------------------------------------
# *** SummarizerUtils ***
# ----------------------------------------------------


@admin.register(SummarizerUtils)
class SummarizerUtilsAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "system_prompt", "created_at", "updated_at")

    def has_add_permission(self, request):
        # Prevent adding new entries if one already exists
        if SummarizerUtils.objects.count() >= 1:
            return False
        return super().has_add_permission(request)
