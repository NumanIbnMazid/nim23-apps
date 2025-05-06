from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.renderers import JSONRenderer
from rest_framework import permissions
from django.db import models
from django.http import Http404
from django.utils.translation import gettext_lazy as _
from django.db.models import Max
from functools import wraps
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import os
from django.conf import settings
from dotenv import load_dotenv
import base64
import logging


logger = logging.getLogger("helpers")


class ResponseWrapper(Response):
    def __init__(
        self,
        data=None,
        error_code=None,
        content_type=None,
        error_message=None,
        message=None,
        response_success=True,
        status=None,
        data_type=None,
    ):
        """
        Custom response wrapper for standardized API responses.
        """

        status_by_default_for_gz = 200
        if error_code is None and status is not None:
            if status > 299 or status < 200:
                error_code = status
                response_success = False
            else:
                status_by_default_for_gz = status
        if error_code is not None:
            status_by_default_for_gz = error_code
            response_success = False

        # Manipulate dynamic messages
        message_map = {
            "list": ("List retrieved successfully!", "Failed to retrieve the list!"),
            "create": ("Created successfully!", "Failed to create!"),
            "update": ("Updated successfully!", "Failed to update!"),
            "partial_update": ("Updated successfully!", "Failed to update!"),
            "destroy": ("Deleted successfully!", "Failed to delete!"),
            "retrieve": (
                "Object retrieved successfully!",
                "Failed to retrieve the object!",
            ),
        }

        if message:
            message = message_map.get(message.lower(), (message, message))[
                0 if response_success else 1
            ]
        else:
            message = "SUCCESS!" if response_success else "FAILED!"

        output_data = {
            "success": response_success,
            "status_code": error_code if error_code else status_by_default_for_gz,
            "data": data,
            "message": message,
            "error": {"code": error_code, "error_details": error_message},
        }
        if data_type is not None:
            output_data["type"] = data_type

        super().__init__(
            data=output_data, status=status_by_default_for_gz, content_type=content_type
        )


def custom_response_wrapper(viewset_cls):
    """
    Custom decorator to wrap the `finalize_response` method of a ViewSet
    with the ResponseWrapper functionality.
    """
    original_finalize_response = viewset_cls.finalize_response

    @wraps(original_finalize_response)
    def wrapped_finalize_response(self, request, response, *args, **kwargs):
        # Ensure DRF's response attributes exist before wrapping
        if not hasattr(response, "accepted_renderer"):
            response.accepted_renderer = request.accepted_renderer
            response.accepted_media_type = request.accepted_media_type
            response.renderer_context = {}

        if isinstance(response, ResponseWrapper):
            return response

        # Create wrapped response after DRF has set attributes
        wrapped_response = ResponseWrapper(
            data=response.data, message=self.action, status=response.status_code
        )

        # Preserve DRF-required attributes
        wrapped_response.accepted_renderer = response.accepted_renderer
        wrapped_response.accepted_media_type = response.accepted_media_type
        wrapped_response.renderer_context = response.renderer_context

        return original_finalize_response(
            self, request, wrapped_response, *args, **kwargs
        )

    viewset_cls.finalize_response = wrapped_finalize_response
    return viewset_cls


def handle_invalid_serializer(exception_obj, message=None):
    error_messages = []
    for field, errors in exception_obj.detail.items():
        field_errors = [str(error) for error in errors]
        error_messages.append(f"{field}: {' '.join(field_errors)}")

    response_message = " ".join(error_messages)

    return ResponseWrapper(message=message, error_message=response_message, status=400)


class CustomModelManager(models.Manager):
    """
    Custom Model Manager
    actions: all(), get_by_id(id), get_by_slug(slug)
    """

    def all(self):
        return self.get_queryset()

    def get_by_id(self, id):
        try:
            return self.get(id=id)
        except self.model.DoesNotExist:
            raise Http404(_("Not Found !!!"))
        except self.model.MultipleObjectsReturned:
            return self.get_queryset().filter(id=id).first()
        except Exception:
            raise Http404(_("Something went wrong !!!"))

    def get_by_slug(self, slug):
        try:
            return self.get(slug=slug)
        except self.model.DoesNotExist:
            raise Http404(_("Not Found !!!"))
        except self.model.MultipleObjectsReturned:
            return self.get_queryset().filter(id=id).first()
        except Exception:
            raise Http404(_("Something went wrong !!!"))


class ProjectGenericModelViewset(ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    lookup_field = "slug"

    def get_queryset(self):
        queryset = super().get_queryset()
        limit = self.request.GET.get("_limit")
        if limit:
            queryset = queryset[: int(limit)]
        return queryset


def get_socket_group_name(group_name, session_id):
    """
    Generates a unique group name for WebSocket connections based on the group name and session ID.
    """
    valid_group_names = ["log", "summarizer"]
    if group_name not in valid_group_names:
        raise ValueError(
            f"Invalid group name: {group_name}. Valid names are: {valid_group_names}"
        )
    if not session_id:
        raise ValueError("Session ID cannot be None or empty.")
    return f"{group_name}_group_{session_id}"


# Django Channels

channel_layer = get_channel_layer()


async def send_log_message_async(
    message=None,
    *,
    group_id=None,
    type="event",
    module="common",
    scope=None,
    sender="server",
    **kwargs,
):
    if group_id is None:
        raise ValueError("`group_id` is required for per-session routing")

    payload = {
        "type": "send.log",
        "message": {
            "type": type,
            "sender": sender,
            "module": module,
            "scope": scope,
            "message": message,
            **kwargs,
        },
    }

    if channel_layer is not None:
        logger.info(f"[helpers][Channels] channel_layer = {channel_layer}")
        await channel_layer.group_send(group_id, payload)


def send_log_message(
    message=None,
    *,
    group_id=None,
    type="event",
    module="common",
    scope=None,
    sender="server",
    **kwargs,
):
    if group_id is None:
        raise ValueError("`group_id` is required for per-session routing")
    payload = {
        "type": "send.log",  # This is the handler method name in your consumer
        "message": {
            "type": type,
            "sender": sender,
            "module": module,
            "scope": scope,
            "message": message,
            **kwargs,  # This allows for any extra keys to be added if needed
        },
    }
    if channel_layer is not None:
        logger.info(f"[helpers][Channels] channel_layer = {channel_layer}")
        async_to_sync(channel_layer.group_send)(group_id, payload)


# Assign Order to Models Instances


def assign_order(instance, model_class, order_field="order"):
    """
    Assigns an automatic order to a new instance of a model.
    It finds the lowest missing integer starting from 1 if any previous order is deleted.

    Args:
        instance (models.Model): The instance for which to assign the order.
        model_class (models.Model): The model class to query existing orders.
        order_field (str): The name of the field to be used for ordering. Default is 'order'.

    Example:
        assign_order(instance, MediaType)
    """
    if instance.pk:  # Existing instances should not update their order
        return

    if getattr(instance, order_field) is not None:
        return  # If the order is manually set, do not override

    existing_orders = model_class.objects.values_list(order_field, flat=True)
    existing_orders = sorted(filter(None, existing_orders))

    max_order = (
        model_class.objects.aggregate(max_order=Max(order_field))["max_order"] or 0
    )

    for i in range(1, max_order + 2):
        if i not in existing_orders:
            setattr(instance, order_field, i)
            break


def get_yt_dlp_cookies_dir():
    """Returns the path to the yt-dlp cookies.txt file."""
    BASE_DIR = settings.BASE_DIR
    COOKIES_DIR = os.path.join(BASE_DIR, "data", "yt-dlp")
    return COOKIES_DIR


def generate_ytdlp_cookies():
    """Generates yt-dlp cookies.txt file from base64-encoded env string."""
    load_dotenv()
    cookies_b64 = os.getenv("YTDLP_COOKIES_B64")
    if not cookies_b64:
        raise ValueError("YTDLP_COOKIES_B64 not set in environment.")

    COOKIES_DIR = get_yt_dlp_cookies_dir()
    COOKIES_PATH = os.path.join(COOKIES_DIR, "cookies.txt")

    if not os.path.exists(COOKIES_PATH):
        print("🔥 Cookies file not found. Generating new cookies.txt...")
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(COOKIES_PATH), exist_ok=True)
        with open(COOKIES_PATH, "wb") as f:
            f.write(base64.b64decode(cookies_b64))
    return COOKIES_PATH


def yt_dlp_cookies_exists():
    """Checks if the yt-dlp cookies.txt file exists."""
    COOKIES_PATH = os.path.join(get_yt_dlp_cookies_dir(), "cookies.txt")
    return os.path.exists(COOKIES_PATH)


def get_cookies_path():
    """Returns the path to the yt-dlp cookies.txt file."""
    COOKIES_PATH = os.path.join(get_yt_dlp_cookies_dir(), "cookies.txt")
    return COOKIES_PATH
