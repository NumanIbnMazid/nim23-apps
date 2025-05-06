from rest_framework import status, permissions
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from dotenv import load_dotenv
from utils.helpers import custom_response_wrapper, ResponseWrapper

from summarizer.api.serializers import SummarizerRequestSerializer
from summarizer.handlers.url_handler import extract_audio_from_url
from summarizer.utils.summarizer import summarize_text

from google import genai

import os
import logging

logger = logging.getLogger("summarizer_views")

load_dotenv()

SUMMARIZER_MODEL = os.getenv("SUMMARIZER_AI_MODEL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini Client
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


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
