import uvicorn


def run():
    uvicorn.run(
        "project.asgi:application",  # Replace with your actual ASGI path
        host="0.0.0.0",
        port=8000,
        reload=True,  # Dev auto-reload
        workers=1,  # 1 worker for reload mode
        timeout_keep_alive=60,
        ws_ping_interval=30,
        ws_ping_timeout=60,
        log_level="info",
        lifespan="off",
    )


if __name__ == "__main__":
    run()
