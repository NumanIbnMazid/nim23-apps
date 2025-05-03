from project.settings.base import *

print("✅ Running Production Settings...")

# ----------------------------------------------------
# *** Allowed Hosts ***
# ----------------------------------------------------
# Initial list of allowed hosts
ALLOWED_HOSTS = [
    "apps.nim23.com",  # Frontend Host (Vercel)
    "nim23-apps.vercel.app",  # Frontend Host (Vercel)
    "backend.apps.nim23.com",  # Backend Host (Northflank)
    "p02--nim23-apps--47v76khxj6jn.code.run",  # Backend Host (Northflank)
]

# Load extra hosts from environment and merge with de-duplication
extra_hosts = os.environ.get("ALLOWED_HOSTS", "")
if extra_hosts:
    combined = ALLOWED_HOSTS + [
        host.strip() for host in extra_hosts.split(",") if host.strip()
    ]
    ALLOWED_HOSTS = list(set(combined))  # Remove duplicates

# ----------------------------------------------------
# *** Static and Media Files Configuration ***
# ----------------------------------------------------
# STATIC & MEDIA URL
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
PUBLIC_ROOT = os.path.join(BASE_DIR, "public/")
# STATIC & MEDIA ROOT
# MEDIA_ROOT = os.path.join(PUBLIC_ROOT, "media/")
STATIC_ROOT = os.path.join(PUBLIC_ROOT, "static/")
# Static Files Directories
STATICFILES_DIRS = (os.path.join(BASE_DIR, "public/", "staticfiles/"),)

# ----------------------------------------------------
# *** Security ***
# ----------------------------------------------------
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "Strict"
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
X_FRAME_OPTIONS = "DENY"
# set low, but when site is ready for deployment, set to at least 15768000 (6 months)
SECURE_HSTS_SECONDS = 15768000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Neededf for CorsHeader
CORS_ORIGIN_ALLOW_ALL = False
# CORS_ALLOW_ALL_ORIGINS = True # If this is used then `CORS_ALLOWED_ORIGINS` will not have any effect
CORS_ORIGIN_WHITELIST = [
    "https://apps.nim23.com",
    "https://www.apps.nim23.com",
]

# ----------------------------------------------------
# *** Site Info ***
# ----------------------------------------------------
# BACKEND_BASE_URL = "https://nim23.com/backend"
BACKEND_BASE_URL = config.BACKEND_BASE_URL
FRONTEND_BASE_URL = "https://nim23.com"

# ----------------------------------------------------
# *** Other Definitions ***
# ----------------------------------------------------
LOGIN_URL = "/admin/login/"

# KNOX Configuration
KNOX_TOKEN_MODEL = "knox.AuthToken"

REST_KNOX = {
    # "SECURE_HASH_ALGORITHM": "hashlib.sha512",
    "AUTH_TOKEN_CHARACTER_LENGTH": 64,
    # "TOKEN_TTL": timedelta(hours=730),
    "TOKEN_TTL": None,  # Never Expire
    "USER_SERIALIZER": "knox.serializers.UserSerializer",
    "TOKEN_LIMIT_PER_USER": None,
    "AUTO_REFRESH": False,
    "MIN_REFRESH_INTERVAL": 60,
    "AUTH_HEADER_PREFIX": "Token",
    "EXPIRY_DATETIME_FORMAT": api_settings.DATETIME_FORMAT,
    "TOKEN_MODEL": "knox.AuthToken",
}

# Swagger Configuration
SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
    },
    "JSON_EDITOR": True,
}
