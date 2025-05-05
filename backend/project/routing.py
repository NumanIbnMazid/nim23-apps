from django.urls import re_path
from project.log_consumers import LogConsumer
from summarizer.consumers import SummarizerConsumer


# ----------------------------------------------------
# *** Websocket URLs ***
# ----------------------------------------------------
websocket_urlpatterns = [
    re_path(r"ws/logs/$", LogConsumer.as_asgi()),
    re_path(r"ws/summarizer/$", SummarizerConsumer.as_asgi()),
]
