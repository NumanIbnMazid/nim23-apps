import io
import base64
import logging
from utils.helpers import send_log_message_async, get_socket_group_name
from asgiref.sync import async_to_sync


logger = logging.getLogger("summarizer")


async def transcribe_audio_base64(
    audio_b64: str,
    model: any,
    batch: bool = False,
    batch_size: int = 8,
    socket_session_id: str = None,
) -> str:
    """
    Transcribes audio from a base64-encoded stream using faster-whisper (non-streaming).
    """
    try:
        if not audio_b64.strip():
            raise ValueError("Received empty base64 audio string")

        audio_bytes = base64.b64decode(audio_b64)
        if not audio_bytes:
            raise ValueError("Decoded audio is empty")

        audio_stream = io.BytesIO(audio_bytes)

        if batch:
            logger.info(
                f"[Whisper] Using batched inference with batch size: {batch_size}"
            )
            segments, info = model.transcribe(audio_stream, batch_size=batch_size)
        else:
            logger.info("[Whisper] Using non-batched inference")
            segments, info = model.transcribe(audio_stream)

        logger.info(
            f"[Whisper] Detected language: {info.language} ({info.language_probability:.2f})"
        )

        socket_group_id = get_socket_group_name(
            group_name="log", session_id=socket_session_id
        )

        transcript = []
        for segment in segments:
            await send_log_message_async(
                f"{segment.start:.2f}s -> {segment.end:.2f}s: {segment.text}",
                group_id=socket_group_id,
                module="summarizer",
                scope="whisper",
            )
            transcript.append(segment.text)

        return " ".join(transcript)
    except Exception as e:
        logger.error(f"[whisper] Error transcribing audio: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")
