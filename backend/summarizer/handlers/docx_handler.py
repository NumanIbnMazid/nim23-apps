from docx import Document
import logging

logger = logging.getLogger("summarizer")


def handle_docx(file) -> str:
    """
    Extract text from a DOCX file.
    """
    try:
        doc = Document(file)
        text = ""
        for para in doc.paragraphs:
            text += para.text
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        raise ValueError("Failed to extract text from DOCX")
