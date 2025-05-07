# summarizer/processing/audio_handler.py
import logging
from summarizer.utils.whisper import transcribe_audio_base64

MAX_AUDIO_SIZE = 10 * 1024 * 1024  # 10 MB
logger = logging.getLogger("audio_handler")


class AudioChunkProcessor:
    def __init__(self, session_id):
        self.session_id = session_id
        self.current_chunk = ""
        self.transcription_chunks = []
        self.audio_chunks = []
        self.total_audio_length = 0
        self.message = None

    async def handle_audio_chunk(self, msg):
        self.message = msg
        chunk = msg.get("message", "")
        is_last = msg.get("is_last", False)
        total_length = msg.get("total_length", 0)
        self.total_audio_length = total_length
        self.current_chunk += chunk

        try:
            if self.total_audio_length < MAX_AUDIO_SIZE:
                logger.debug(
                    "# Audio chunk size is within the limit. Prcessing in one go..."
                )
                if is_last:
                    logger.debug("# Last audio chunk received. Transcribing...")
                    await self.transcribe_main()
            else:
                logger.debug(
                    "# Audio chunk size exceeds the limit. Processing in chunks..."
                )
                self.audio_chunks.append(chunk)
                await self.transcribe_main()
        except Exception as e:
            logger.warning(f"🚨 Error processing audio chunk: {e}")
            try:
                logger.info("# Attempting to transcribe with fallback method...")
                await self.transcribe_fallback()
            except Exception as e:
                logger.error(f"❌ Error in fallback transcription: {e}")
                self.audio_chunks = []
                self.current_chunk = ""
                self.transcription_chunks = []
                raise e

    async def transcribe_main(self):
        transcript = await transcribe_audio_base64(
            self.current_chunk, socket_session_id=self.session_id
        )
        self.transcription_chunks.append(transcript)
        self.current_chunk = ""

    async def transcribe_fallback(self):
        is_last = self.message.get("is_last", False)
        if is_last:
            full_audio = "".join(self.audio_chunks)
            transcript = await transcribe_audio_base64(
                full_audio, socket_session_id=self.session_id
            )
            self.transcription_chunks.append(transcript)
            self.audio_chunks = []
            self.current_chunk = ""

    async def finalize(self):
        return " ".join(self.transcription_chunks)
