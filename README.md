# NIM23 Apps

A monorepo of small web apps. The frontend is Next.js 15 and the backend is Django 5 with Django REST Framework.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Apps

| App | Route | What it does |
| --- | --- | --- |
| Grabit | `/grabit` | Downloads video and audio with yt-dlp. Paste a link from YouTube, Facebook, Instagram, X, TikTok or another supported site, pick a format and quality (up to 8K), then download the video or just the audio. |
| Humanizer AI | `/humanizer-ai` | Rewrites stiff or AI-generated text so it reads more naturally. The tone and system prompt can be changed in the Django admin. It uses Gemini right now, and the code also has clients for Anthropic and OpenRouter. |
| Summarizer | `/summarizer` | Summarizes text, documents (PDF, DOCX, TXT, Markdown), uploaded audio or video, or a URL. Audio and video are transcribed with Faster-Whisper first, then Gemini writes the summary. Progress is sent to the browser over a WebSocket. |
| Recommendr | `/recommendr` | Recommends movies, shows, documentaries or music based on mood, genre, language, occasion and rating. Results are filled in with data from IMDb, OMDb, YouTube and Spotify, and recent results are cached so the same titles don't keep coming back. |
| AI Text Detector | API only | Gives a score from 0 to 100 for how likely a piece of text is AI-generated, using a model on OpenRouter. The endpoint is `/api/detect-ai/detect/`. There is no UI for it yet. |

The home page at `/` lists all the apps. There are also `/contact` and `/privacy` pages.

## How it fits together

The browser only talks to the Next.js app. Next.js has route handlers in `frontend/src/app/api/` that forward each request to the Django API and add the backend token (`SECRET_BACKEND_API_TOKEN`) on the server, so the token never reaches the browser.

The Django backend runs on Uvicorn (ASGI), with one Django app per product. It uses Knox for token auth, drf-yasg for the Swagger and ReDoc docs, and Django Channels to stream progress for long jobs like transcription and recommendations. Inside the container, Supervisor runs Uvicorn and Redis together.

PostgreSQL stores the app data. Redis is the cache and the Channels layer. The external services are Gemini, OpenRouter, Faster-Whisper, Spotify, OMDb, IMDb, YouTube and yt-dlp.

The system prompts for Humanizer AI, Summarizer and Recommendr, along with Recommendr's moods, genres, languages, occasions and ratings, are Django models. You can change them in the admin without touching the code.

## Tech stack

- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, SWR, next-pwa, FFmpeg WASM, pdf.js, Mammoth, Sonner
- Backend: Django 5.1, Django REST Framework, Django Channels, django-rest-knox, drf-yasg, Uvicorn, Supervisor, django-prometheus
- Data: PostgreSQL, Redis
- AI and media: Google Gemini, OpenRouter, Faster-Whisper, yt-dlp, Spotipy, Cinemagoer (IMDb), OMDb, YouTube Data API
- Ops: Docker, Docker Compose, Nginx, GitHub Actions, Prometheus, Grafana

## Repository layout

```
backend/                  Django project
  project/                settings, ASGI and WSGI, routers, WebSocket routing
  users/                  custom user model and Knox login
  grabit/                 media info and downloads (yt-dlp)
  humanizer_ai/           text rewriting
  summarizer/             transcription, summarization, WebSocket consumer
  recommendr/             recommendation engine, taxonomy models, cache
  detect_ai/              AI text detection
  seeders/                seed data for Recommendr
  utils/                  shared helpers, mixins, throttles, decorators
  requirements.txt
frontend/                 Next.js app
  src/app/                pages and the /api route handlers
  src/components/         UI components for each app
  src/lib/                API clients, metadata, constants, types
nginx/                    reverse proxy config for the backend
docker-compose.yml        backend only
docker-compose.all.yml    backend, frontend and nginx
UTILS.md                  notes on Supervisor, Prometheus, Grafana and yt-dlp
TODO.md                   backlog
```

## Getting started

### Prerequisites

- Python 3.12
- Node.js 20 or newer, and Yarn
- PostgreSQL 14 or newer
- Redis 6 or newer
- FFmpeg (Grabit and Summarizer need it)
- On Debian or Ubuntu: `build-essential libffi-dev libjpeg-dev libpq-dev`

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp ../.env.sample .env        # fill it in, see Environment variables below
python manage.py migrate
python manage.py createsuperuser
python dev_server.py          # Uvicorn with auto-reload on http://localhost:8000
```

To run Redis and Uvicorn through Supervisor, the same way the container does:

```bash
supervisord -c supervisord.conf
```

To load the Recommendr seed data:

```bash
python manage.py shell < seeders/recommendr_seeder_1.py
```

Once it's running:

- API: <http://localhost:8000/api/>
- Swagger: <http://localhost:8000/swagger/> (login required)
- ReDoc: <http://localhost:8000/redoc/> (login required)
- Admin: <http://localhost:8000/admin/>
- Health check: <http://localhost:8000/health/>
- Prometheus metrics: <http://localhost:8000/metrics>

### Frontend

```bash
cd frontend
yarn install
cp ../.env.sample .env         # fill it in, see Environment variables below
yarn dev                       # http://localhost:3000
```

Other scripts: `yarn build`, `yarn start`, `yarn lint`, `yarn tsc`, `yarn find:unused`.

### Docker

The backend image includes Redis and Supervisor, so it can run on its own:

```bash
docker compose up --build                             # backend on port 8000
docker compose -f docker-compose.all.yml up --build   # backend, frontend and nginx
```

Both compose files read `backend/.env` and `frontend/.env`. Next.js reads `NEXT_PUBLIC_*` values at build time, so the frontend image takes them as build arguments. See `frontend/Dockerfile`.

## Environment variables

Start from `.env.sample`. The backend reads `backend/.env` and the frontend reads `frontend/.env`.

### Backend

| Variable | Purpose |
| --- | --- |
| `MODE` | `DEVELOPMENT`, `STAGING` or `PRODUCTION` |
| `SECRET_KEY` | Django secret key |
| `LOG_LEVEL`, `DJANGO_LOG_LEVEL` | Logging level |
| `ALLOWED_HOSTS` | Comma-separated list of hosts |
| `BACKEND_BASE_URL` | Base URL of the backend |
| `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_URL` | Cache and Channels layer |
| `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD` | Superuser created when the container starts |
| `GEMINI_API_KEY` | Google Gemini, used by Humanizer AI, Summarizer and Recommendr |
| `OPENROUTER_API_KEY` | OpenRouter, used by the AI Text Detector |
| `ANTHROPIC_API_KEY` | Optional Anthropic client |
| `HUMANIZER_AI_CLIENT`, `HUMANIZER_AI_MODEL` | Provider and model for Humanizer AI |
| `SUMMARIZER_AI_MODEL`, `RECOMMENDR_AI_MODEL`, `AI_DETECTOR_AI_MODEL` | Model for each app |
| `WHISPER_MODEL_SIZE`, `WHISPER_DEVICE`, `WHISPER_BATCH_ENABLED`, `WHISPER_BATCH_SIZE` | Local Faster-Whisper transcription |
| `FASTER_WHISPER_API_URL`, `FASTER_WHISPER_API_KEY`, `HF_TOKEN`, `HF_WHISPER_SPACE` | Remote transcription service |
| `GOOGLE_API_KEY` | YouTube Data API for Recommendr |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Spotify data for Recommendr |
| `OMDB_API_KEY` | OMDb data for Recommendr |
| `RECOMMENDR_RECOMMENDATION_CACHE_TIMEOUT` | How long recent recommendations are remembered |
| `YTDLP_COOKIES_B64` | Base64 cookie file for yt-dlp |
| `PYTUBE_ACCESS_TOKEN`, `PYTUBE_REFRESH_TOKEN`, `PYTUBE_EXPIRES`, `PYTUBE_PO_TOKEN`, `PYTUBE_VISITOR_DATA` | pytubefix credentials |

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MODE` | Runtime mode |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the frontend |
| `NEXT_PUBLIC_PORTFOLIO_SITE_URL` | Link to the portfolio |
| `NEXT_PUBLIC_BACKEND_BASE_URL`, `NEXT_PUBLIC_BACKEND_API_BASE_URL` | Backend URL and API base URL |
| `NEXT_PUBLIC_BACKEND_DOMAIN` | Domain used to build the WebSocket URL |
| `NEXT_PUBLIC_WHISPER_BACKEND_DOMAIN` | Domain of the Whisper WebSocket service |
| `SECRET_BACKEND_API_TOKEN` | Knox token, only used on the server by the route handlers |
| `NEXT_PUBLIC_EMAIL_JS_SERVICE_ID`, `NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY` | Contact form (EmailJS) |
| `SECRET_GA_PROPERTY_ID`, `SECRET_GA_PROJECT_ID`, `SECRET_GA_CLIENT_EMAIL`, `SECRET_GA_PRIVATE_KEY` | Google Analytics Data API |
| `NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS`, `NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS` | Word limits for Humanizer AI input |

Secret values start with `SECRET_` and are only read inside the Next.js route handlers. Don't rename one to `NEXT_PUBLIC_`, or it will be sent to the browser.

## API

All endpoints are under `/api/`. Unless a row says otherwise, they need a Knox token in the header: `Authorization: Token <token>`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login/` | Get a Knox token |
| `POST` | `/api/auth/logout/` | Invalidate the current token |
| `POST` | `/api/auth/logoutall/` | Invalidate all of the user's tokens |

### Grabit

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/grabit-fetch-media-info/details/?media_url=` | Formats and qualities for a media URL (rate limited) |
| `GET` | `/api/grabit-fetch-media-info/detail/?media_url=` | Detailed media info |
| `GET` | `/api/grabit-download/media-download-info/` | Find a downloadable stream |
| `GET` | `/api/grabit-download/process-media-download/` | Stream the download |

### Humanizer AI

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/humanizer-ai/humanize/` | Rewrite text so it reads naturally |

### Summarizer

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/summarizer/summarize/` | Summarize a block of text |
| `POST` | `/api/summarizer/extract-audio-url/` | Get an audio stream URL from a page or media link |

### Recommendr

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/recommendr/preferences/` | Media types, moods, genres, languages, occasions and ratings |
| `POST` | `/api/recommendr/recommend/` | Recommendations for the chosen preferences (rate limited) |

### AI Text Detector

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/detect-ai/detect/` | Returns a score from 0 to 100. Public, no token needed. |

Logged-in users can browse the API docs at `/swagger/` and `/redoc/`.

## WebSockets

| Path | Purpose |
| --- | --- |
| `ws/logs/` | Progress and log messages for Summarizer and Recommendr |
| `ws/summarizer/` | Transcription and summarization events |

The frontend builds these URLs from `NEXT_PUBLIC_BACKEND_DOMAIN` (`ws://localhost:8000` in development).

## Rate limits

Default DRF throttle rates, set in `backend/project/settings/base.py`:

| Scope | Rate |
| --- | --- |
| Logged-in users | 150 per minute |
| Anonymous users | 100 per minute |
| Grabit media info | 10 per minute |
| Recommendr | 1000 per minute |

## CI

Two GitHub Actions workflows run on pull requests and tags. One runs ESLint on `frontend/` and the other runs flake8 on the Django project. Dependabot keeps dependencies up to date (`.github/dependabot.yaml`).

## Roadmap

Open work is in [TODO.md](TODO.md). The main items are tighter auth on every API call, chunked and batched summarization for long media, input validation and size limits, moving to Tailwind v4, and adding YouTube Music as a Recommendr source.

## License

MIT. See [LICENSE](LICENSE). Copyright 2025 Numan Ibn Mazid.

## Contact

- Portfolio: [nim23.com](https://nim23.com)
- GitHub: [@NumanIbnMazid](https://github.com/NumanIbnMazid)
- LinkedIn: [Numan Ibn Mazid](https://www.linkedin.com/in/numanibnmazid/)
- Email: [numanibnmazid@gmail.com](mailto:numanibnmazid@gmail.com)
