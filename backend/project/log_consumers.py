import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
import asyncio
from utils.helpers import get_socket_group_name


logger = logging.getLogger("log_consumers")


class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.ping_interval = 30  # seconds
        self.session_id = self.scope["query_string"].decode().split("session_id=")[-1]
        self.group_name = get_socket_group_name(
            group_name="log", session_id=self.session_id
        )
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send(
            text_data=json.dumps(
                {
                    "message": f"🟢 [LogConsumer] Connected with session_id={self.session_id}"
                }
            )
        )
        logger.info(f"🟢 [LogConsumer] Connected with session_id={self.session_id}")
        # Start a background task for keep-alive (pinging)
        self.keep_alive_task = asyncio.create_task(self.keep_alive())

    async def disconnect(self, close_code):
        if hasattr(self, "keep_alive_task"):
            self.keep_alive_task.cancel()
            try:
                await self.keep_alive_task
            except asyncio.CancelledError:
                logger.info("🛑 [LogConsumer] Keep-alive task cancelled")

        logger.warning(f"🔴 [LogConsumer] WebSocket disconnected (code: {close_code})")
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def keep_alive(self):
        logger.info("🟢 [LogConsumer] Keep-alive started")
        try:
            while True:
                await asyncio.sleep(self.ping_interval)
                await self.send(text_data=json.dumps({"type": "ping"}))
        except asyncio.CancelledError:
            pass

    async def send_log(self, event):
        logger.info(f"✅ [LogConsumer] Sending log message: {event['message']}")
        await self.send(text_data=json.dumps({"message": event["message"]}))

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Showing logs in the console
        message_str = str(data)
        preview = message_str[:100] + ("..." if len(message_str) > 100 else "")
        logger.info(f"🔵 [LogConsumer] Received message: {preview}")

        if data.get("type") == "ready":
            ip = self.scope["client"][0]
            logger.info(f"✅ [LogConsumer] WebSocket ready flag set for {ip}")
        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))
