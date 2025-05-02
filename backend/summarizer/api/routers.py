from project.router import router
from summarizer.api.views import SummarizerViewset

router.register("summarizer", SummarizerViewset, basename="summarizer")
