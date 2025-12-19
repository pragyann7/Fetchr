from rest_framework import serializers

class ProxyRequestSerializer(serializers.Serializer):
    url = serializers.URLField()
    method = serializers.CharField()
    queryParams = serializers.ListField(required=False)
    headers = serializers.ListField(required=False)
    body = serializers.JSONField(required=False, allow_null=True)
    auth = serializers.JSONField(required=False, allow_null=True)
