from rest_framework import status, permissions
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from dotenv import load_dotenv
from utils.helpers import custom_response_wrapper, ResponseWrapper

from summarizer.api.serializers import SummarizerRequestSerializer
from summarizer.handlers.url_handler import extract_audio_from_url
from summarizer.handlers.pdf_handler import handle_pdf
from summarizer.handlers.docx_handler import handle_docx
from summarizer.handlers.text_handler import handle_text
from summarizer.utils.whisper import transcribe_audio_base64
from summarizer.utils.summarizer import summarize_text

from google import genai
from faster_whisper import WhisperModel

import os
import mimetypes
import logging
import base64
import requests


logger = logging.getLogger("summarizer")

load_dotenv()

SUMMARIZER_MODEL = os.getenv("SUMMARIZER_AI_MODEL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Gemini Client
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Singleton Whisper model
_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("[Whisper] Loading model...")
        _whisper_model = WhisperModel(
            "small", device="cpu"
        )  # change to "medium" or "large" if needed
    return _whisper_model


whisper_model = get_whisper_model()


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

        url = validated.get("url")
        file = validated.get("file")
        text = validated.get("text")

        try:
            if url:
                # If the URL is a video/audio URL (e.g., YouTube/Facebook)
                extracted_audio_url = extract_audio_from_url(url)
                # Download audio bytes
                audio_response = requests.get(extracted_audio_url)
                if audio_response.status_code != 200:
                    raise Exception("Failed to fetch audio from extracted URL.")

                base64_audio = base64.b64encode(audio_response.content).decode("utf-8")
                text = transcribe_audio_base64(
                    audio_b64=base64_audio, model=whisper_model
                )

            elif file:
                mime_type, _ = mimetypes.guess_type(file.name)

                if (
                    mime_type
                    and mime_type.startswith("audio")
                    or mime_type.startswith("video")
                ):
                    base64_audio = base64.b64encode(file.read()).decode("utf-8")
                    text = transcribe_audio_base64(
                        audio_b64=base64_audio, model=whisper_model
                    )

                elif mime_type == "application/pdf":
                    text = handle_pdf(file)

                elif mime_type in [
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ]:
                    text = handle_docx(file)

                elif mime_type == "text/plain":
                    text = handle_text(file)

            elif text:
                pass  # already assigned

            # Summarize final extracted text
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
