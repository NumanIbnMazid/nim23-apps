from django.db import models
from django.conf import settings
from django.utils.timezone import datetime
from django.utils.translation import gettext_lazy as _
from utils.helpers import CustomModelManager
from utils.snippets import file_as_base64


"""
----------------------- * Custom Model Admin Mixins * -----------------------
"""


class CustomModelAdminMixin(object):
    """
    DOCSTRING for CustomModelAdminMixin:
    This model mixing automatically displays all fields of a model in admin panel following the criteria.
    code: @ Numan Ibn Mazid
    """

    def __init__(self, model, admin_site):
        self.list_display = [
            field.name
            for field in model._meta.fields
            if field.get_internal_type() != "TextField"
        ]
        super(CustomModelAdminMixin, self).__init__(model, admin_site)
