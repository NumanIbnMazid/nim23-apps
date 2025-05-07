import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
import asyncio
import uuid
from utils.helpers import get_socket_group_name


logger = logging.getLogger("log_consumers")


class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.ping_interval = 20  # seconds
        self.client_ip = self.scope["client"][0]
        self.session_id = self.scope["query_string"].decode().split("session_id=")[-1]
        self.group_name = get_socket_group_name(
            group_name="log", session_id=self.session_id
        )
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send(
            text_data=json.dumps(
                {
                    "message": f"🔵 [LogConsumer] Connected! [Group: {self.group_name}, IP: {self.client_ip}]"
                }
            )
        )
        logger.info(
            f"🔵 [LogConsumer] Connected! [Group: {self.group_name}, IP: {self.client_ip}]"
        )
        # Start a background task for keep-alive (pinging)
        self.keep_alive_task = asyncio.create_task(self.keep_alive())

    async def disconnect(self, close_code):
        if hasattr(self, "keep_alive_task"):
            self.keep_alive_task.cancel()
            try:
                await self.keep_alive_task
            except asyncio.CancelledError:
                logger.warning(
                    f"🛑 [LogConsumer] Keep-alive task cancelled. [Group: {self.group_name}, IP: {self.client_ip}]"
                )

        logger.warning(
            f"🔴 [LogConsumer] WebSocket disconnected (code: {close_code}). [Group: {self.group_name}, IP: {self.client_ip}]"
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def keep_alive(self):
        logger.debug("🟢 [LogConsumer] Keep-alive started")
        try:
            while True:
                await asyncio.sleep(self.ping_interval)
                await self.send(text_data=json.dumps({"type": "ping"}))
        except asyncio.CancelledError:
            pass

    async def send_log(self, event):
        log_id = str(uuid.uuid4())  # Generate a unique ID
        message_obj = {
            "id": log_id,
            "message": event["message"],
        }
        logger.debug(
            f"✅ [LogConsumer] Sending log message: {message_obj} to group: {self.group_name}"
        )
        await self.send(text_data=json.dumps(message_obj))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            logger.debug(f"✅ [LogConsumer] Received: {data.get('type')}")

            if data.get("type") == "ping":
                # await self.send(text_data=json.dumps({"type": "pong"}))
                return
            elif data.get("type") == "pong":
                return
            elif data.get("type") == "ready":
                # logger.info(
                #     f"🟢 [LogConsumer] WebSocket ready flag set for ip: {self.client_ip} with session: {self.session_id}"
                # )
                return
            else:
                # Showing logs in the console
                message_str = str(data)
                message_max_size = 300
                preview = message_str[:message_max_size] + (
                    ". . ." if len(message_str) > message_max_size else ""
                )
                logger.debug(f"✅ [LogConsumer] Received message: {preview}")
                return
        except Exception as e:
            logger.exception("❌ [LogConsumer] Error in WebSocket")
            await self.send(json.dumps({"type": "error", "message": str(e)}))
