from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
except ImportError:
    genai = None

class ChatBotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        api_key = settings.GEMINI_API_KEY
        
        if not genai:
            return Response({"error": "Chatbot dependency (google-generativeai) is missing."}, status=503)

        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message is required."}, status=400)

        # Fallback to Mock if no key
        if not api_key:
             return Response({
                "role": "model",
                "content": "⚠️ **System Notice**: The `GEMINI_API_KEY` is missing.\n\nI am operating in **Demo Mode**. Once you configure the API key, I will be fully functional!\n\nYou said: " + user_message
            })

        history_data = request.data.get('history', []) # List of { role: 'user'|'model', parts: [...] }
        context = request.data.get('context', '') # e.g. "Course: React Basics, Lesson: Hooks"

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # Construct chat history for Gemini
            gemini_history = []
            for msg in history_data:
                role = 'user' if msg.get('role') == 'user' else 'model'
                content = msg.get('content', '')
                if content:
                    gemini_history.append({'role': role, 'parts': [content]})

            chat = model.start_chat(history=gemini_history)
            
            if not gemini_history and context:
                prompt_with_context = f"Context: {context}\n\nStudent Question: {user_message}\n\nAnswer as a helpful tutor."
                response = chat.send_message(prompt_with_context)
            else:
                 response = chat.send_message(user_message)

            return Response({
                "role": "model",
                "content": response.text
            })

        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            return Response({"error": "Failed to get response from AI tutor.", "details": str(e)}, status=500)
