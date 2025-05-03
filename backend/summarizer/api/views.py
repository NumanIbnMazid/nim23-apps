from rest_framework import status, permissions
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from dotenv import load_dotenv
from utils.helpers import custom_response_wrapper, ResponseWrapper

from summarizer.api.serializers import SummarizerRequestSerializer
from summarizer.handlers.url_handler import extract_audio_from_url
from summarizer.utils.whisper import transcribe_audio_base64
from summarizer.utils.summarizer import summarize_text

from google import genai
from faster_whisper import WhisperModel, BatchedInferencePipeline

import os
import logging

logger = logging.getLogger("summarizer")

load_dotenv()

SUMMARIZER_MODEL = os.getenv("SUMMARIZER_AI_MODEL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini Client
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

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


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("[Whisper] Loading model...")
        _whisper_model = WhisperModel(whisper_model_size, device=whisper_device)
    logger.info(f"[Whisper] Model [{whisper_model_size}] loaded: {str(_whisper_model)}")
    return _whisper_model


whisper_model = get_whisper_model()

whisper_batched_model = BatchedInferencePipeline(model=whisper_model)


@custom_response_wrapper
class SummarizerViewset(GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = SummarizerRequestSerializer

    @swagger_auto_schema(
        method="post",
        request_body=SummarizerRequestSerializer,
        responses={200: openapi.Response("Summarized text")},
    )
    @action(detail=False, methods=["post"], url_path="summarize")
    def summarize(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        text = validated.get("text")

        try:
            if not text:
                raise ValueError("'text' must be provided.")

            summary = summarize_text(text, model=SUMMARIZER_MODEL, client=gemini_client)
            return ResponseWrapper(data={"summary": summary}, status=status.HTTP_200_OK)

        except Exception as e:
            return ResponseWrapper(
                message="Failed to summarize input.",
                error_message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        method="post",
        manual_parameters=[
            openapi.Parameter(
                "url",
                openapi.IN_BODY,
                description="URL of the target media",
                type=openapi.TYPE_STRING,
            )
        ],
        responses={200: openapi.Response("Extracted audio URL")},
    )
    @action(detail=False, methods=["post"], url_path="extract-audio-url")
    def extract_audio_url(self, request):
        url = request.data.get("url")
        if not url:
            return ResponseWrapper(
                message="URL is required.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            extracted_audio_url = extract_audio_from_url(url)
            return ResponseWrapper(
                data={"extracted_audio_url": extracted_audio_url},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return ResponseWrapper(
                message="Failed to extract audio from URL.",
                error_message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        method="post",
        manual_parameters=[
            openapi.Parameter(
                "audio_b64",
                openapi.IN_BODY,
                description="Base64 encoded audio",
                type=openapi.TYPE_STRING,
            )
        ],
        responses={200: openapi.Response("Extracted audio URL")},
    )
    @action(detail=False, methods=["post"], url_path="transcribe-bs64-audio")
    def transcribe_bs64_audio(self, request):
        audio_b64 = request.data.get("audio_b64")
        text = ""
        try:
            if audio_b64:
                if whisper_batch_enabled:
                    text = transcribe_audio_base64(
                        audio_b64=audio_b64,
                        model=whisper_batched_model,
                        batch=True,
                        batch_size=whisper_batch_size,
                    )
                else:
                    text = transcribe_audio_base64(
                        audio_b64=audio_b64, model=whisper_model
                    )
            return ResponseWrapper(
                data={"transcription": text}, status=status.HTTP_200_OK
            )

        except Exception as e:
            return ResponseWrapper(
                message="Failed to transcribe audio.",
                error_message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )
