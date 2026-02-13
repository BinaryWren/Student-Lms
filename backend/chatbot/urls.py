from django.urls import path
from .views import ChatBotView

urlpatterns = [
    path('ask/', ChatBotView.as_view(), name='chatbot_ask'),
]
