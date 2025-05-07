from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from config import config
import os
import django
import threading
import time

if config.MODE == "PRODUCTION":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.production")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.development")

django.setup()


def periodic_model_unloader():
    from summarizer.utils.whisper import model_cache

    while True:
        model_cache.unload_model_if_idle()
        time.sleep(60)  # check every minute


# Start background thread on app start
threading.Thread(target=periodic_model_unloader, daemon=True).start()

import project.routing

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(project.routing.websocket_urlpatterns)
        ),
    }
)
