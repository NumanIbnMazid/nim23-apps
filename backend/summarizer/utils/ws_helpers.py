import json
import logging

logger = logging.getLogger("summarizer_ws_helpers")


def parse_message(text_data):
    try:
        return json.loads(text_data)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format")


async def send_error_response(consumer, error_message):
    try:
        await consumer.send(json.dumps({"type": "error", "message": error_message}))
    except Exception as e:
        logger.warning(f"❌ Failed to send error message: {e}")
