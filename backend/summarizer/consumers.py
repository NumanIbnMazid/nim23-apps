import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from summarizer.utils.whisper import transcribe_audio_base64
from summarizer.api.views import get_whisper_model
from asgiref.sync import sync_to_async

logger = logging.getLogger("summarizer_consumers")

MAX_AUDIO_SIZE = 1024 * 1024 * 10  # Max size for chunk processing (10MB)

class SummarizerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.transcription_chunks = []
        self.audio_chunks = []
        self.total_audio_length = 0
        self.current_chunk = ""
        logger.info("🟢 [Summarizer] WebSocket connected")

    async def disconnect(self, close_code):
        logger.info("🔴 [Summarizer] WebSocket disconnected")
        self.transcription_chunks = []
        self.audio_chunks = []

    async def receive(self, text_data):
        try:
            data = self.parse_message(text_data)
            message_type = data.get("type")
            message_content = data.get("message", {})

            if message_type == "datastream" and message_content.get("type") == "data":
                await self.handle_audio_chunk(message_content)

            elif message_type == "datastream" and message_content.get("type") == "signal":
                await self.handle_end_chunk_signal(message_content)

            else:
                await self.send_error_response("Invalid message format")

        except Exception as e:
            logger.exception("❌ [Summarizer] Error processing WebSocket message")
            await self.send_error_response(f"Exception: {str(e)}")

    # Parse the incoming WebSocket message (modular and reusable)
    def parse_message(self, text_data):
        try:
            return json.loads(text_data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing message: {e}")
            raise ValueError("Invalid JSON format")

    # Handle the audio chunk, with fallback handling if needed
    async def handle_audio_chunk(self, message_content):
        chunk = message_content.get("message")
        is_last = message_content.get("is_last", False)
        total_length = message_content.get("total_length", 0)

        self.total_audio_length = total_length
        self.current_chunk += chunk

        # First try the main process if the size is small
        if self.total_audio_length < MAX_AUDIO_SIZE:
            logger.info("Processing audio in one go")
            if is_last:
                try:
                    await self.transcribe_and_store_main()
                except Exception as e:
                    logger.error(f"Main process failed: {e}")
                    logger.info("Falling back to secondary processing method")
                    await self.transcribe_and_store_fallback()
        else:
            # Process audio chunk by chunk
            logger.info("Processing audio chunk by chunk")
            if is_last:
                try:
                    await self.transcribe_and_store_main()
                except Exception as e:
                    logger.error(f"Main process failed: {e}")
                    logger.info("Falling back to secondary processing method")
                    await self.transcribe_and_store_fallback()

    # Transcribe using the main method (for smaller audio size)
    async def transcribe_and_store_main(self):
        transcription = await transcribe_audio_base64(self.current_chunk, model=get_whisper_model())
        self.transcription_chunks.append(transcription)
        self.current_chunk = ""  # Reset chunk buffer

    # Transcribe using the fallback method (for larger audio size)
    async def transcribe_and_store_fallback(self):
        logger.info("Using fallback method for transcription")
        full_audio_b64 = "".join(self.audio_chunks)
        full_transcription = await sync_to_async(transcribe_audio_base64)(full_audio_b64, model=get_whisper_model())
        self.transcription_chunks.append(full_transcription)
        self.audio_chunks = []  # Reset audio buffer

    # Handle the end chunk signal and send the transcription result
    async def handle_end_chunk_signal(self, message_content):
        if message_content.get("message") == "END_CHUNK":
            logger.info("🟡 Received END_CHUNK signal")
            full_transcription = " ".join(self.transcription_chunks)
            await self.send_transcription_result(full_transcription)
            self.transcription_chunks = []

    # Send the transcription result back to the client
    async def send_transcription_result(self, transcription):
        await self.send(
            text_data=json.dumps({
                "type": "datastream",
                "message": {
                    "type": "transcription_result",
                    "sender": "server",
                    "module": "summarizer",
                    "scope": "full_transcription",
                    "message": transcription,
                }
            })
        )

    # Send error response in case of invalid data format or failure
    async def send_error_response(self, error_message):
        await self.send(
            text_data=json.dumps({
                "type": "error",
                "message": error_message
            })
        )
