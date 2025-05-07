import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import uuid
from utils.helpers import get_socket_group_name
from summarizer.utils.audio_transcription_processor import AudioChunkProcessor

logger = logging.getLogger("summarizer_consumers")


class SummarizerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.ping_interval = 20  # seconds
        self.client_ip = self.scope["client"][0]
        self.session_id = self.scope["query_string"].decode().split("session_id=")[-1]
        self.group_name = get_socket_group_name("summarizer", self.session_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        self.processor = AudioChunkProcessor(session_id=self.session_id)
        await self.send(
            text_data=json.dumps(
                {
                    "message": f"🔵 [SummarizerConsumer] Connected! [Group: {self.group_name}, IP: {self.client_ip}]"
                }
            )
        )
        logger.info(
            f"🔵 [SummarizerConsumer] Connected! [Group: {self.group_name}, IP: {self.client_ip}]"
        )
        self.keep_alive_task = asyncio.create_task(self.keep_alive())

    async def disconnect(self, close_code):
        if hasattr(self, "keep_alive_task"):
            self.keep_alive_task.cancel()
            try:
                await self.keep_alive_task
            except asyncio.CancelledError:
                logger.info("🛑 [SummarizerConsumer] Keep-alive task cancelled")

        logger.warning(
            f"🔴 [SummarizerConsumer] WebSocket disconnected (code: {close_code}). [Group: {self.group_name}, IP: {self.client_ip}]"
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.info(f"✅ [SummarizerConsumer] Received: {data.get('type')}")

            if data.get("type") == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
                return
            elif data.get("type") == "pong":
                return
            elif data.get("type") == "ready":
                # logger.info(
                #     f"🟢 [SummarizerConsumer] WebSocket ready flag set for ip: {self.client_ip} with session: {self.session_id}"
                # )
                return
            elif data.get("type") == "datastream":
                msg = data.get("message", {})
                if msg.get("type") == "data":
                    await self.processor.handle_audio_chunk(msg)
                elif msg.get("type") == "signal" and msg.get("message") == "END_CHUNK":
                    transcription = await self.processor.finalize()
                    await self.send_transcription_result(transcription)
                return
        except Exception as e:
            logger.exception("❌ [SummarizerConsumer] Error in WebSocket")
            await self.send(json.dumps({"type": "error", "message": str(e)}))

    async def send_log(self, event):
        log_id = str(uuid.uuid4())  # Generate a unique ID
        message_obj = {
            "id": log_id,
            "message": event["message"],
        }
        logger.info(
            f"✅ [SummarizerConsumer] Sending log message: {message_obj} to group: {self.group_name}"
        )
        await self.send(text_data=json.dumps(message_obj))

    async def keep_alive(self):
        logger.info("🟢 [SummarizerConsumer] Keep-alive started")
        try:
            while True:
                await asyncio.sleep(self.ping_interval)
                await self.send(text_data=json.dumps({"type": "ping"}))
        except asyncio.CancelledError:
            pass

    async def send_transcription_result(self, transcription):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "datastream",
                    "message": {
                        "type": "transcription_result",
                        "sender": "server",
                        "module": "summarizer",
                        "scope": "full_transcription",
                        "message": transcription,
                    },
                }
            )
        )
