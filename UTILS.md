# UTILS FILE

## Running Project

### With Supervisor

```bash
supervisord -c supervisord.conf
```

### Local Daphne with Reload for File Changes

```bash
python dev_server.py
```

## Code Quality Analysis Github Workflow

* <https://github.com/code4romania/seismic-risc/tree/develop/.github/workflows>

## Generate requirements.txt file from Poetry

 $ poetry export -f requirements.txt --output requirements.txt

 Generate without hashes

 $ poetry export -f requirements.txt --output requirements.txt --without-hashes

## VSCODE Workspace Settings (.vscode)

```json
{
    "eslint.options": {
      "configFile": "/home/numan/Workspace/PERSONAL/PROJECTS/nim23/frontend/.eslintrc.json"
    }
}

```

## Linux Required Packages

build-essential libffi-dev libjpeg-dev libpq-dev


## Grabit Utils

### `bgutil-ytdlp-pot-provider`

Source: <https://github.com/Brainicism/bgutil-ytdlp-pot-provider>

```bash
docker run --name bgutil-provider -d -p 4416:4416 brainicism/bgutil-ytdlp-pot-provider
```

Using Native:

```bash
git clone --single-branch --branch 0.8.2 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git
cd bgutil-ytdlp-pot-provider/server/
yarn install --frozen-lockfile
npx tsc
node build/main.js
```
### Pytube Resources

- https://pytubefix.readthedocs.io/en/latest/user/auth.html
- https://pytube.io/en/latest/api.html
- https://github.com/pytube/pytube/issues/1894#issue-2180600881
- https://github.com/pytube/pytube/issues/1322

### Humanizer AI

#### Shortlisted Models

URL: https://openrouter.ai/models

Models:
- nvidia/llama-3.1-nemotron-nano-8b-v1:free

## Prometheus

- sudo apt-get install prometheus
- sudo nano /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'django-app'
    static_configs:
      - targets: ['localhost:8000']
- sudo systemctl restart prometheus
- sudo systemctl disable prometheus
- sudo systemctl enable prometheus
- sudo systemctl start prometheus
- sudo systemctl stop prometheus
- http://localhost:9090

## Graphana

### Installation

- https://grafana.com/grafana/download

```bash
sudo apt-get install -y adduser libfontconfig1 musl
wget https://dl.grafana.com/enterprise/release/grafana-enterprise_12.0.0_amd64.deb
sudo dpkg -i grafana-enterprise_12.0.0_amd64.deb

sudo systemctl start grafana-server
sudo systemctl enable grafana-server
sudo systemctl status grafana-server
sudo systemctl stop grafana-server
sudo systemctl disable grafana-server

sudo nano /etc/grafana/grafana.ini
```

```ini
[server]
# Protocol (http, https, socket)
protocol = http

# The ip address to bind to, empty will bind to all interfaces
http_addr =

# The http port to use
http_port = 3001
```
🚨 Important: remove the semicolon ; at the beginning of both lines!

- http://127.0.0.1:3001/
- 
Default username and password: admin/admin

Connection URL: http://localhost:9090

## OTHER RESOURCES

- Sample icons: ✅, ❌, 🚫, 🟢, 🔴, 🟡, 🔵, 🟣, 🟠, 🟡, 🛠, 📍, ❓, ⚠️, 🧪, 🔊, 🔄, 👈, 📄, 🚨, ⚙️, 🔧, 💾, 🧠, ⚡, 

- Youtube Alterntives to download: https://yewtu.be/, https://id.420129.xyz/, https://freetubeapp.io/
- https://askubuntu.com/questions/1342197/why-is-youtube-dl-blocking-me-from-downloading-youtube-videos-which-are-supposed
- https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
- https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies
- Recommender Setting for Uvicorn Worker: workers = (2 × CPU cores) + 1 (common Gunicorn/Uvicorn formula). But Higher Memory Usage.

### Sample Video Audio Files

- https://www.youtube.com/watch?v=ry9SYnV3svc&ab_channel=LearnEnglishbyPocketPassport
- http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4
- https://voiceage.com/wbsamples/out48s/Trailer.wav