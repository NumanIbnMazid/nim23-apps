import io
import base64
import logging

logger = logging.getLogger("summarizer")


def transcribe_audio_base64(audio_b64: str, model: any) -> str:
    """
    Transcribes audio from a base64-encoded audio stream using Whisper.
    """
    try:
        audio_bytes = base64.b64decode(audio_b64)
        audio_stream = io.BytesIO(audio_bytes)

        segments, info = model.transcribe(audio_stream)
        logger.info(
            f"[Whisper] Detected language: {info.language} ({info.language_probability})"
        )

        return " ".join([seg.text for seg in segments])
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")
