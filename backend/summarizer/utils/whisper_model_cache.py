import time
import threading
from faster_whisper import WhisperModel
import logging
import os


logger = logging.getLogger("summarizer_whisper_model_cache")

MODEL_TIMEOUT_SECONDS = 60  # 5 minutes


class WhisperModelCache:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.model = None
        self.last_used = None

    def get_model(
        self,
        model_size=os.getenv("WHISPER_MODEL_SIZE", "tiny"),
        device=os.getenv("WHISPER_DEVICE", "cpu"),
    ):
        with self._lock:
            now = time.time()
            if self.model is None or (now - self.last_used > MODEL_TIMEOUT_SECONDS):

                if model_size not in ["tiny", "base", "small", "medium", "large"]:
                    raise ValueError("Invalid whisper model size!")
                if device not in ["cpu", "cuda"]:
                    raise ValueError("Invalid whisper device!")
                logger.info(
                    f"🔵 [WhisperModelCache] Loading model: {model_size} on {device}..."
                )
                self.model = WhisperModel(model_size, device=device)
            else:
                logger.info(
                    f"🟢 [WhisperModelCache] Model already loaded. Using model {model_size} at {str(self.model)}..."
                )
            self.last_used = now
            return self.model

    def unload_model_if_idle(self):
        with self._lock:
            if self.model and (time.time() - self.last_used > MODEL_TIMEOUT_SECONDS):
                logger.info(
                    "🟠 [WhisperModelCache] Unloading model from memory due to inactivity!"
                )
                self.model = None
