import io
import base64
import os
import logging
from utils.helpers import send_log_message_async, get_socket_group_name
from faster_whisper import WhisperModel, BatchedInferencePipeline
from dotenv import load_dotenv


load_dotenv()

logger = logging.getLogger("summarizer")

# Whisper
whisper_model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
whisper_device = os.getenv("WHISPER_DEVICE", "cpu")
whisper_batch_enabled = os.getenv("WHISPER_BATCH_ENABLED", "False").lower() == "true"
whisper_batch_size = int(os.getenv("WHISPER_BATCH_SIZE", 8))

if whisper_model_size not in ["tiny", "base", "small", "medium", "large"]:
    raise ValueError("Invalid whisper model size")

if whisper_device not in ["cpu", "cuda"]:
    raise ValueError("Invalid whisper device")

# Singleton Whisper model
_whisper_model = None
_batched_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"🟡 [Whisper] Loading model: {whisper_model_size}...")
        _whisper_model = WhisperModel(whisper_model_size, device=whisper_device)
    else:
        logger.info(
            f"🟢 [Whisper] Model already loaded. Using model {whisper_model_size} at {str(_whisper_model)}..."
        )
    return _whisper_model


def get_batched_model():
    global _batched_model
    if _batched_model is None:
        _batched_model = BatchedInferencePipeline(model=get_whisper_model())
    return _batched_model


async def transcribe_audio_base64(
    audio_b64: str,
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
            model = get_batched_model()
            logger.info(
                f"[Whisper] Using batched inference with batch size: {batch_size}"
            )
            segments, info = model.transcribe(audio_stream, batch_size=batch_size)
        else:
            model = get_whisper_model()
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
