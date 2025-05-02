import logging

logger = logging.getLogger("summarizer")


def handle_text(file) -> str:
    """
    Extract text from a TXT file.
    """
    try:
        text = file.read().decode("utf-8")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from TXT: {e}")
        raise ValueError("Failed to extract text from TXT")
