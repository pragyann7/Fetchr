from django.urls import path
from .views import SendRequestView, home

urlpatterns = [
    path("send/", SendRequestView.as_view()),
    path("", home)
]