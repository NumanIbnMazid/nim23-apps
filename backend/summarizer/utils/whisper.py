import io
import base64
import logging
from utils.helpers import send_log_message


logger = logging.getLogger("summarizer")


def transcribe_audio_base64(
    audio_b64: str, model: any, batch: bool = False, batch_size: int = 8
) -> str:
    """
    Transcribes audio from a base64-encoded stream using faster-whisper (non-streaming).
    """
    try:
        audio_bytes = base64.b64decode(audio_b64)
        audio_stream = io.BytesIO(audio_bytes)

        if batch:
            segments, info = model.transcribe(audio_stream, batch_size=batch_size)
        else:
            segments, info = model.transcribe(audio_stream)

        logger.info(
            f"[Whisper] Detected language: {info.language} ({info.language_probability:.2f})"
        )

        transcript = []
        for segment in segments:
            send_log_message(
                f"{segment.start:.2f}s -> {segment.end:.2f}s: {segment.text}",
                module="summarizer",
                scope="whisper",
            )
            transcript.append(segment.text)

        return " ".join(transcript)
    except Exception as e:
        logger.error(f"[whisper] Error transcribing audio: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")
