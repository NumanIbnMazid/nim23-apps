from .router import router

# Users
from users.api.routers import *

# ----------------------------------------------------
# *** Grabit ***
# ----------------------------------------------------
from grabit.api.routers import *

# ----------------------------------------------------
# *** humanizer AI ***
# ----------------------------------------------------
from humanizer_ai.api.routers import *

# ----------------------------------------------------
# *** AI Text Detector ***
# ----------------------------------------------------
from detect_ai.api.routers import *
from humanizer_ai.api.routers import *

# ----------------------------------------------------
# *** Recommendation System ***
# ----------------------------------------------------
from recommendr.api.routers import *


app_name = "NIM23 APPS Backend"
urlpatterns = router.urls
