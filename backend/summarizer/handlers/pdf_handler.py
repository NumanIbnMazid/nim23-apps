from PyPDF2 import PdfReader
import logging

logger = logging.getLogger("summarizer")


def handle_pdf(file) -> str:
    """
    Extract text from a PDF file.
    """
    try:
        pdf_reader = PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError("Failed to extract text from PDF")
