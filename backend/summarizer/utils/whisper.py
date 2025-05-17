import io
import os
import base64
import logging
import tempfile

import httpx
from dotenv import load_dotenv
from gradio_client import Client, handle_file

from faster_whisper import BatchedInferencePipeline
from summarizer.utils.whisper_model_cache import WhisperModelCache
from utils.helpers import send_log_message_async, get_socket_group_name

load_dotenv()

logger = logging.getLogger("summarizer_whisper")

# Configs
whisper_model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
whisper_device = os.getenv("WHISPER_DEVICE", "cpu")
whisper_batch_enabled = os.getenv("WHISPER_BATCH_ENABLED", "False").lower() == "true"
whisper_batch_size = int(os.getenv("WHISPER_BATCH_SIZE", 8))
faster_whisper_api_url = os.getenv("FASTER_WHISPER_API_URL", "").strip()
hf_api_space = os.getenv("HF_WHISPER_SPACE", "hf-audio/whisper-large-v3-turbo")
hf_token = os.getenv("HF_TOKEN")
hf_client = Client(hf_api_space, hf_token=hf_token)

model_cache = WhisperModelCache()
_batched_model = None


def get_whisper_model():
    return model_cache.get_model(model_size=whisper_model_size, device=whisper_device)


def get_batched_model():
    global _batched_model
    if _batched_model is None:
        _batched_model = BatchedInferencePipeline(model=get_whisper_model())
    return _batched_model


async def call_faster_whisper_api(
    audio_b64: str, start_offset: float = 0.0, socket_session_id: str = None
) -> str:
    if not faster_whisper_api_url:
        raise ValueError("FASTER_WHISPER_API_URL is not set")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{faster_whisper_api_url}/transcribe",
                json={
                    "audio_base64": audio_b64,
                    "start_offset": start_offset,
                    "socket_session_id": socket_session_id,
                },
                headers={"x-api-key": os.getenv("FASTER_WHISPER_API_KEY", "")},
                timeout=60,
            )
            response.raise_for_status()
            return response.json().get("transcription", "")
    except httpx.HTTPError as e:
        logger.error(f"[API] Error calling faster-whisper API: {e}")
        raise ValueError(f"External API error: {e}")


def call_huggingface_whisper(audio_b64: str) -> str:
    """
    Decode base64 audio, save as temporary file, send to HF whisper-large-v3-turbo, and return result.
    """
    if not audio_b64.strip():
        raise ValueError("Empty base64 audio provided")

    audio_bytes = base64.b64decode(audio_b64)
    if not audio_bytes:
        raise ValueError("Decoded audio is empty")

    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=".wav"
        ) as temp_audio_file:
            temp_audio_file.write(audio_bytes)
            temp_audio_path = temp_audio_file.name

        result = hf_client.predict(
            inputs=handle_file(temp_audio_path), task="transcribe", api_name="/predict"
        )

        if not result:
            raise ValueError("No result returned from Hugging Face Whisper API")

        logger.debug(f"[HF Whisper] Transcription result: {result}")

        return result.strip()

    except Exception as e:
        logger.error(f"[HF Whisper] Hugging Face Whisper API error: {e}")
        raise ValueError(f"Hugging Face Whisper API error: {e}")

    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            logger.info(f"🔧 Deleting temporary audio file: {temp_audio_path}")
            os.remove(temp_audio_path)


async def transcribe_audio_base64(
    audio_b64: str,
    batch: bool = False,
    batch_size: int = 8,
    socket_session_id: str = None,
    start_offset: float = 0.0,
    use_faster_whisper_api: bool = False,
    use_hf_api: bool = False,
) -> str:
    """
    Transcribes audio from a base64-encoded stream using:
    - Local faster-whisper (default)
    - External faster-whisper API (if `use_faster_whisper_api=True`)
    - Hugging Face whisper-large-v3-turbo (if `use_hf_api=True`)
    """
    try:
        if use_hf_api:
            logger.info("📍 # [Whisper] Using Hugging Face Whisper API")
            return call_huggingface_whisper(audio_b64)

        if use_faster_whisper_api:
            logger.info("📍 # [Whisper] Using external faster-whisper API")
            response = await call_faster_whisper_api(
                audio_b64,
                start_offset=start_offset,
                socket_session_id=socket_session_id,
            )
            if not response:
                raise ValueError("Empty response from faster-whisper API")
            logger.debug(f"[Whisper] Transcription from API: {response}")
            return response

        logger.info("📍 # [Whisper] Using local faster-whisper model")

        if not audio_b64.strip():
            raise ValueError("Received empty base64 audio string")

        audio_bytes = base64.b64decode(audio_b64)
        if not audio_bytes:
            raise ValueError("Decoded audio is empty")

        audio_stream = io.BytesIO(audio_bytes)

        if batch:
            model = get_batched_model()
            logger.debug(
                f"[Whisper] Using batched inference with batch size: {batch_size}"
            )
            segments, info = model.transcribe(audio_stream, batch_size=batch_size)
        else:
            model = get_whisper_model()
            logger.debug("[Whisper] Using non-batched inference")
            segments, info = model.transcribe(audio_stream)

        logger.debug(
            f"[Whisper] Detected language: {info.language} ({info.language_probability:.2f})"
        )

        socket_group_id = get_socket_group_name("log", session_id=socket_session_id)

        transcript = []
        for segment in segments:
            global_start = start_offset + segment.start
            global_end = start_offset + segment.end
            await send_log_message_async(
                f"{global_start:.2f}s -> {global_end:.2f}s: {segment.text}",
                group_id=socket_group_id,
                module="summarizer",
                scope="whisper",
            )
            transcript.append(segment.text)

        return " ".join(transcript)

    except Exception as e:
        logger.error(f"[Whisper] Error during transcription: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")
