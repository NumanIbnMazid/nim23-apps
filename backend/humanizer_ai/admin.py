from django.contrib import admin
from humanizer_ai.models import HumanizerAiUtils

# ----------------------------------------------------
# *** HumanizerAiUtils ***
# ----------------------------------------------------


@admin.register(HumanizerAiUtils)
class HumanizerAiUtilsAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "system_prompt", "created_at", "updated_at")

    def has_add_permission(self, request):
        # Prevent adding new entries if one already exists
        if HumanizerAiUtils.objects.count() >= 1:
            return False
        return super().has_add_permission(request)
