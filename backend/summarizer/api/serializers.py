from rest_framework import serializers

class SummarizerRequestSerializer(serializers.Serializer):
    # Input options (only one should be required at a time)
    url = serializers.URLField(required=False, help_text="YouTube, Facebook or any video/audio URL")
    file = serializers.FileField(required=False, help_text="Local media/document file (video, audio, pdf, docx, txt)")
    text = serializers.CharField(required=False, help_text="Raw plain text input")

    def validate(self, data):
        if not data.get("url") and not data.get("file") and not data.get("text"):
            raise serializers.ValidationError("Provide at least one of: url, file, or text.")
        return data
