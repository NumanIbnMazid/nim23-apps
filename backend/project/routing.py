from django.urls import path
from project.consumers import LogConsumer
from summarizer.consumers import SummarizerConsumer


# ----------------------------------------------------
# *** Websocket URLs ***
# ----------------------------------------------------
websocket_urlpatterns = [
    path("ws/logs/", LogConsumer.as_asgi()),
    path("ws/summarizer/", SummarizerConsumer.as_asgi()),
]
