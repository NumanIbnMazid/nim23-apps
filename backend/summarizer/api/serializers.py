from rest_framework import serializers


class SummarizerRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=False)

    def validate(self, data):
        if not data.get("text"):
            raise serializers.ValidationError("Text is required.")
        return data
