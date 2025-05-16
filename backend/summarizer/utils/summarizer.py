from google import genai
import logging
from summarizer.models import SummarizerUtils


logger = logging.getLogger("summarizer_summarizer")

def get_prompt():
    system_prompt = SummarizerUtils.objects.first().system_prompt
    if not system_prompt:
        raise ValueError("System prompt is empty")
    return system_prompt

def summarize_text(text: str, model: str, client: any) -> str:
    """
    Summarizes the provided text using Gemini AI.
    """
    try:
        system_prompt = get_prompt()
        user_prompt = f"Summarize the following text:\n\n{text}"

        logger.debug(f"Summarizing text with Gemini AI model: {model}")
        logger.debug(f"User prompt: {user_prompt}")
        logger.debug(f"System prompt: {system_prompt}")

        response = client.models.generate_content(
            model=model,
            contents=user_prompt,
            config=genai.types.GenerateContentConfig(
                temperature=1.0,
                max_output_tokens=8192,
                system_instruction=system_prompt,
            ),
        )
        logger.debug(f"✅ Response Text:\n\n {response.text}\n\n")
        return response.text
    except Exception as e:
        logger.error(f"Error summarizing text: {e}")
        raise ValueError(f"Failed to summarize text: {e}")
