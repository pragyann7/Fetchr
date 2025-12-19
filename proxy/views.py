import base64
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProxyRequestSerializer
from django.shortcuts import render


def home(request):
    return render(request, "index.html")


class SendRequestView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = ProxyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        url = data["url"]
        method = data["method"].upper()

        # query params
        params = {
            p["key"]: p["value"]
            for p in data.get("queryParams", [])
            if p.get("enabled")
        }

        # headers
        headers = {
            h["key"]: h["value"]
            for h in data.get("headers", [])
            if h.get("enabled")
        }

        # auth
        auth = data.get("auth")
        if auth:
            if auth["type"] == "basic":
                token = base64.b64encode(
                    f'{auth["username"]}:{auth["password"]}'.encode()
                ).decode()
                headers["Authorization"] = f"Basic {token}"

            elif auth["type"] == "bearer":
                headers["Authorization"] = f'Bearer {auth["token"]}'

        try:
            resp = requests.request(
                method=method,
                url=url,
                params=params,
                headers=headers,
                json=data.get("body"),
            )

            return Response({
                "status": resp.status_code,
                "headers": dict(resp.headers),
                "body": resp.text,
            })

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)
