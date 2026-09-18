# NIM23 Apps

**A monorepo of small, useful web apps built.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Apps](#apps)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [WebSockets](#websockets)
- [Rate Limiting](#rate-limiting)
- [Continuous Integration](#continuous-integration)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## Apps

| App | Route | What it does |
| --- | --- | --- |
| **Grabit** | [`/grabit`](https://apps.nim23.com/grabit) | Video and audio downloader powered by `yt-dlp`. Paste a link from YouTube, Facebook, Instagram, X/Twitter, TikTok and more, inspect the available formats and qualities (up to 8K), and download the video or extract audio only. |
| **Humanizer AI** | [`/humanizer-ai`](https://apps.nim23.com/humanizer-ai) | Rewrites robotic or AI-generated text into natural, human-sounding prose. Tone and system prompt are configurable from the Django admin, and the LLM client is pluggable (Gemini today, with Anthropic and OpenRouter wiring in place). |
| **Summarizer** | [`/summarizer`](https://apps.nim23.com/summarizer) | Distills text, documents (PDF, DOCX, TXT, Markdown), uploaded audio/video, or any URL into a concise summary. Media is transcribed with Faster-Whisper, then summarized with Gemini. Progress is streamed back to the browser over a WebSocket. |
| **Recommendr** | [`/recommendr`](https://apps.nim23.com/recommendr) | Mood- and vibe-based media recommendation engine. Pick a media type, mood, genre, language, occasion and rating, and get curated movies, shows, documentaries or music — enriched with metadata from IMDb, OMDb, YouTube and Spotify, with recent results cached so you don't see the same titles twice. |
| **AI Text Detector** | API only | Scores a block of text 0–100 for how likely it is to be AI-generated, via an OpenRouter model. Exposed at `/api/detect-ai/detect/`; no UI is shipped yet. |

The landing page at [apps.nim23.com](https://apps.nim23.com) lists every app with a live card, and `/contact` and `/privacy` round out the site.

---

## Architecture

```text
  ┌──────────────────────────────────────────────────────────────┐
  │ Browser                                                      │
  └──────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ Next.js 15  ·  App Router  ·  PWA                            │
  │                                                              │
  │ • App pages and UI                                           │
  │ • Route handlers under /api/* proxy every call and           │
  │   attach the backend token, so no secret is ever             │
  │   exposed to the browser                                     │
  └──────────────────────────────────────────────────────────────┘
                                 │   HTTPS (Token auth)  +  WSS
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ Django 5 + DRF  ·  served by Uvicorn (ASGI)                  │
  │                                                              │
  │ • One Django app per product                                 │
  │ • Knox token auth, Swagger / ReDoc documentation             │
  │ • Channels for live progress streaming                       │
  │ • Supervisor runs Uvicorn and Redis together                 │
  └──────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ PostgreSQL     application data                              │
  │ Redis          cache + Channels layer                        │
  │ External       Gemini, OpenRouter, Whisper, Spotify,         │
  │                OMDb, IMDb, YouTube, yt-dlp                   │
  └──────────────────────────────────────────────────────────────┘
```

A few things worth calling out:

- **Secrets stay server-side.** The browser never talks to the Django API directly. Every call goes through a Next.js route handler in `frontend/src/app/api/`, which attaches the `SECRET_BACKEND_API_TOKEN` and forwards the request.
- **Long jobs stream.** Summarizer transcription and recommendation runs push structured log messages over Django Channels so the UI can show real progress instead of a spinner.
- **Config lives in the database where it should.** System prompts for Humanizer AI, Summarizer and Recommendr — plus Recommendr's moods, genres, languages, occasions and ratings — are editable models in the Django admin, so behaviour can be tuned without a deploy.

---

## Tech Stack

**Frontend** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · SWR · next-pwa · FFmpeg WASM · pdf.js · Mammoth · Sonner

**Backend** — Django 5.1 · Django REST Framework · Django Channels · django-rest-knox · drf-yasg (Swagger/ReDoc) · Uvicorn · Supervisor · django-prometheus

**Data** — PostgreSQL · Redis (cache + channel layer)

**AI & media** — Google Gemini · OpenRouter · Faster-Whisper · yt-dlp · Spotipy · Cinemagoer (IMDb) · OMDb · YouTube Data API

**Ops** — Docker & Docker Compose · Nginx · GitHub Actions · Prometheus + Grafana

---

## Repository Layout

```
.
├── backend/                  Django project
│   ├── project/              settings, ASGI/WSGI, routers, websocket routing
│   ├── users/                custom user model + Knox login
│   ├── grabit/               media info + download (yt-dlp)
│   ├── humanizer_ai/         AI-to-human text rewriting
│   ├── summarizer/           transcription + summarization, WS consumer
│   ├── recommendr/           recommendation engine, taxonomy models, cache
│   ├── detect_ai/            AI-generated text detection
│   ├── seeders/              seed data for Recommendr taxonomies
│   ├── utils/                shared helpers, mixins, throttles, decorators
│   └── requirements.txt
├── frontend/                 Next.js application
│   └── src/
│       ├── app/              routes, page clients, /api route handlers
│       ├── components/       per-app UI components
│       ├── lib/              API clients, metadata, constants, types
│       ├── hooks/ providers/ layout/ styles/
├── nginx/                    reverse proxy config for the backend
├── docker-compose.yml        backend only
├── docker-compose.all.yml    backend + frontend + nginx
├── UTILS.md                  operational notes (supervisor, Prometheus, Grafana, yt-dlp)
└── TODO.md                   running backlog
```

---

## Getting Started

### Prerequisites

- Python 3.12
- Node.js 20+ and Yarn
- PostgreSQL 14+
- Redis 6+
- FFmpeg (required by Grabit and Summarizer)
- On Debian/Ubuntu: `build-essential libffi-dev libjpeg-dev libpq-dev`

### Backend Setup

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp ../.env.sample .env        # then fill it in — see Environment Variables
python manage.py migrate
python manage.py createsuperuser
python dev_server.py          # Uvicorn with auto-reload on http://localhost:8000
```

Optional extras:

```bash
supervisord -c supervisord.conf     # run Redis + Uvicorn the way production does
python manage.py shell < seeders/recommendr_seeder_1.py
```

Once it is up:

- API root — <http://localhost:8000/api/>
- Swagger — <http://localhost:8000/swagger/> (login required)
- ReDoc — <http://localhost:8000/redoc/> (login required)
- Admin — <http://localhost:8000/admin/>
- Health — <http://localhost:8000/health/>
- Metrics — <http://localhost:8000/metrics>

### Frontend Setup

```bash
cd frontend
yarn install
cp ../.env.sample .env         # then fill it in — see Environment Variables
yarn dev                       # http://localhost:3000
```

Other scripts: `yarn build`, `yarn start`, `yarn lint`, `yarn tsc`, `yarn find:unused`.

### Running with Docker

The backend image bundles Redis and Supervisor, so it runs standalone:

```bash
docker compose up --build                             # backend on :8000
docker compose -f docker-compose.all.yml up --build   # backend + frontend + nginx
```

Both compose files read `backend/.env` and `frontend/.env`. Because Next.js bakes `NEXT_PUBLIC_*` values at build time, the frontend image takes them as build arguments — see `frontend/Dockerfile`.

---

## Environment Variables

`.env.sample` is the starting point. The backend reads `backend/.env`; the frontend reads `frontend/.env`.

### Backend

| Variable | Purpose |
| --- | --- |
| `MODE` | `DEVELOPMENT`, `STAGING` or `PRODUCTION` |
| `SECRET_KEY` | Django secret key |
| `LOG_LEVEL`, `DJANGO_LOG_LEVEL` | Logging verbosity |
| `ALLOWED_HOSTS` | Comma-separated host list |
| `BACKEND_BASE_URL` | Public base URL of the backend |
| `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_URL` | Cache and channel layer |
| `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD` | Auto-created superuser on container start |
| `GEMINI_API_KEY` | Google Gemini — Humanizer AI, Summarizer, Recommendr |
| `OPENROUTER_API_KEY` | OpenRouter — AI Text Detector |
| `ANTHROPIC_API_KEY` | Optional Anthropic client |
| `HUMANIZER_AI_CLIENT`, `HUMANIZER_AI_MODEL` | Humanizer provider and model |
| `SUMMARIZER_AI_MODEL`, `RECOMMENDR_AI_MODEL`, `AI_DETECTOR_AI_MODEL` | Per-app model selection |
| `WHISPER_MODEL_SIZE`, `WHISPER_DEVICE`, `WHISPER_BATCH_ENABLED`, `WHISPER_BATCH_SIZE` | Local Faster-Whisper transcription |
| `FASTER_WHISPER_API_URL`, `FASTER_WHISPER_API_KEY`, `HF_TOKEN`, `HF_WHISPER_SPACE` | Remote transcription service |
| `GOOGLE_API_KEY` | YouTube Data API for Recommendr |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Spotify enrichment |
| `OMDB_API_KEY` | OMDb enrichment |
| `RECOMMENDR_RECOMMENDATION_CACHE_TIMEOUT` | How long recent recommendations are remembered |
| `YTDLP_COOKIES_B64` | Base64 cookie jar for yt-dlp |
| `PYTUBE_ACCESS_TOKEN`, `PYTUBE_REFRESH_TOKEN`, `PYTUBE_EXPIRES`, `PYTUBE_PO_TOKEN`, `PYTUBE_VISITOR_DATA` | pytubefix credentials |

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MODE` | Runtime mode |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `NEXT_PUBLIC_PORTFOLIO_SITE_URL` | Link back to the main portfolio |
| `NEXT_PUBLIC_BACKEND_BASE_URL`, `NEXT_PUBLIC_BACKEND_API_BASE_URL` | Backend origin and API base |
| `NEXT_PUBLIC_BACKEND_DOMAIN` | Domain used to build the `wss://` URL |
| `NEXT_PUBLIC_WHISPER_BACKEND_DOMAIN` | Domain of the Whisper WebSocket service |
| `SECRET_BACKEND_API_TOKEN` | Knox token used **server-side only** by the route handlers |
| `NEXT_PUBLIC_EMAIL_JS_SERVICE_ID`, `NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY` | Contact form via EmailJS |
| `SECRET_GA_PROPERTY_ID`, `SECRET_GA_PROJECT_ID`, `SECRET_GA_CLIENT_EMAIL`, `SECRET_GA_PRIVATE_KEY` | Google Analytics Data API |
| `NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS`, `NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS` | Input length bounds for Humanizer AI |

> Anything that must stay secret is prefixed `SECRET_` and is read only inside Next.js route handlers. Never move one of those to a `NEXT_PUBLIC_` name.

---

## API Reference

All endpoints live under `/api/` and, unless noted, require a Knox token (`Authorization: Token <token>`).

**Auth**

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login/` | Obtain a Knox token |
| `POST` | `/api/auth/logout/` | Invalidate the current token |
| `POST` | `/api/auth/logoutall/` | Invalidate every token for the user |

**Grabit**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/grabit-fetch-media-info/details/?media_url=` | Formats and qualities for a media URL (throttled) |
| `GET` | `/api/grabit-fetch-media-info/detail/?media_url=` | Detailed media info |
| `GET` | `/api/grabit-download/media-download-info/` | Resolve a downloadable stream |
| `GET` | `/api/grabit-download/process-media-download/` | Stream the download |

**Humanizer AI**

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/humanizer-ai/humanize/` | Rewrite text into human-sounding prose |

**Summarizer**

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/summarizer/summarize/` | Summarize a block of text |
| `POST` | `/api/summarizer/extract-audio-url/` | Extract an audio stream URL from a page/media link |

**Recommendr**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/recommendr/preferences/` | Media types, moods, genres, languages, occasions, ratings |
| `POST` | `/api/recommendr/recommend/` | Recommendations for the chosen preferences (throttled) |

**AI Text Detector**

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/detect-ai/detect/` | Returns a 0–100 AI-likelihood score. Public — no token required. |

Interactive documentation is available at `/swagger/` and `/redoc/` for logged-in users.

---

## WebSockets

| Path | Purpose |
| --- | --- |
| `ws/logs/` | Per-session progress and log stream used by Summarizer and Recommendr |
| `ws/summarizer/` | Transcription and summarization events |

The frontend derives these from `NEXT_PUBLIC_BACKEND_DOMAIN` (`ws://localhost:8000` in development).

---

## Rate Limiting

DRF throttling defaults, configurable in `backend/project/settings/base.py`:

| Scope | Rate |
| --- | --- |
| Authenticated users | 150/minute |
| Anonymous users | 100/minute |
| Grabit media info | 10/minute |
| Recommendr | 1000/minute |

---

## Continuous Integration

Two GitHub Actions workflows run on pull requests and tags:

- **Code Style (Next.js)** — ESLint over `frontend/`
- **Code Style (Python)** — flake8 over the Django project

Dependabot keeps dependencies current via `.github/dependabot.yaml`.

---

## Roadmap

Open work is tracked in [TODO.md](TODO.md) — the current themes are tightening auth on every API call, chunked and batched summarization for long media, input validation and size limits, Tailwind v4, and a YouTube Music source for Recommendr.

---

## License

Released under the [MIT License](LICENSE). © 2025 Numan Ibn Mazid.

---

## Contact

- Apps — [apps.nim23.com](https://apps.nim23.com)
- Portfolio — [nim23.com](https://nim23.com)
- GitHub — [@NumanIbnMazid](https://github.com/NumanIbnMazid)
- LinkedIn — [Numan Ibn Mazid](https://www.linkedin.com/in/numanibnmazid/)
- Email — [numanibnmazid@gmail.com](mailto:numanibnmazid@gmail.com)
