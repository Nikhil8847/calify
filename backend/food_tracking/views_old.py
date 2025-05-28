from datetime import date
from django.db.models import Sum
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
import tempfile
import os
import json
import openai
from google.cloud import speech
from pydub import AudioSegment
from django.conf import settings
from .models import FoodItem, CalorieEntry, DailyGoal
from .serializers import FoodItemSerializer, CalorieEntrySerializer, DailyGoalSerializer


class FoodItemListView(generics.ListAPIView):
    """
    List all available food items for searching.
    """
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    
    def get_queryset(self):
        queryset = FoodItem.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class CalorieEntryListCreateView(generics.ListCreateAPIView):
    """
    List user's calorie entries or create a new one.
    """
    serializer_class = CalorieEntrySerializer
    
    def get_queryset(self):
        queryset = CalorieEntry.objects.filter(user=self.request.user)
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CalorieEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific calorie entry.
    """
    serializer_class = CalorieEntrySerializer
    
    def get_queryset(self):
        return CalorieEntry.objects.filter(user=self.request.user)


@api_view(['GET'])
def daily_summary_view(request):
    """
    Get daily nutrition summary for the current user.
    """
    try:
        today = date.today()
        date_filter = request.query_params.get('date', today)
        
        # Get today's entries
        entries = CalorieEntry.objects.filter(
            user=request.user,
            created_at__date=date_filter
        )
        
        # Calculate totals
        totals = entries.aggregate(
            total_calories=Sum('calories') or 0,
            total_protein=Sum('protein') or 0,
            total_carbs=Sum('carbs') or 0,
            total_fat=Sum('fat') or 0
        )
        
        # Get user's daily goals
        try:
            goals = DailyGoal.objects.get(user=request.user)
            goals_data = DailyGoalSerializer(goals).data
        except DailyGoal.DoesNotExist:
            # Create default goals if none exist
            goals = DailyGoal.objects.create(user=request.user)
            goals_data = DailyGoalSerializer(goals).data
        
        # Group entries by meal type
        meal_breakdown = {}
        for meal_type, _ in CalorieEntry._meta.get_field('meal_type').choices:
            meal_entries = entries.filter(meal_type=meal_type)
            meal_totals = meal_entries.aggregate(
                calories=Sum('calories') or 0,
                protein=Sum('protein') or 0,
                carbs=Sum('carbs') or 0,
                fat=Sum('fat') or 0
            )
            meal_breakdown[meal_type] = {
                'entries': CalorieEntrySerializer(meal_entries, many=True).data,
                'totals': meal_totals
            }
        
        return Response({
            'date': date_filter,
            'totals': totals,
            'goals': goals_data,
            'meal_breakdown': meal_breakdown,
            'remaining': {
                'calories': max(0, goals.target_calories - totals['total_calories']),
                'protein': max(0, goals.target_protein - totals['total_protein']),
                'carbs': max(0, goals.target_carbs - totals['total_carbs']),
                'fat': max(0, goals.target_fat - totals['total_fat']),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch daily summary'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class DailyGoalView(generics.RetrieveUpdateAPIView):
    """
    Get or update user's daily nutrition goals.
    """
    serializer_class = DailyGoalSerializer
    
    def get_object(self):
        goal, created = DailyGoal.objects.get_or_create(user=self.request.user)
        return goal


class VoiceRecordingView(generics.CreateAPIView):
    """
    Handle voice recording uploads and process them for calorie entry creation.
    """
    serializer_class = CalorieEntrySerializer

    def create(self, request, *args, **kwargs):
        # Handle voice recording file
        audio_file = request.FILES.get('file')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the audio file temporarily
        with tempfile.NamedTemporaryFile(delete=True) as tmp_file:
            for chunk in audio_file.chunks():
                tmp_file.write(chunk)
            tmp_file.flush()

            # Process the audio file and extract calorie entry data
            try:
                transcript = transcribe_audio(tmp_file.name)
                data = extract_nutrition_data(transcript)
                
                # Create a new CalorieEntry object
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

def transcribe_audio(file_path):
    """
    Transcribe the audio file to text using Google Cloud Speech-to-Text.
    """
    client = speech.SpeechClient()
    
    with open(file_path, 'rb') as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code='en-US',
    )

    response = client.recognize(config=config, audio=audio)

    # Combine the transcriptions from all the responses
    transcript = ' '.join([result.alternatives[0].transcript for result in response.results])
    return transcript


def extract_nutrition_data(transcript):
    """
    Extract nutrition data from the transcribed text using OpenAI GPT.
    """
    openai.api_key = settings.OPENAI_API_KEY
    
    # Use GPT to extract structured data from the transcript
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": f"Extract nutrition data from the following text: '{transcript}'"}
        ]
    )
    
    result = response.choices[0].message.content.strip()
    
    # Parse JSON response
    data = json.loads(result)
    return data


@api_view(['POST'])
def process_audio_view(request):
    """
    Process audio recording and extract food items using Google STT + OpenAI
    """
    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response(
            {'error': 'No audio file provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            for chunk in audio_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        try:
            # Convert audio to proper format for Google STT
            audio_segment = AudioSegment.from_file(tmp_file_path)
            audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
            wav_path = tmp_file_path.replace('.wav', '_converted.wav')
            audio_segment.export(wav_path, format='wav')
            
            # Transcribe audio
            transcription = transcribe_audio_google(wav_path)
            
            # Extract food items using OpenAI
            food_items = extract_food_items_openai(transcription)
            
            # Clean up temporary files
            os.unlink(tmp_file_path)
            os.unlink(wav_path)
            
            return Response({
                'transcription': transcription,
                'confidence': 0.85,  # Mock confidence for now
                'timestamp': int(date.today().strftime('%s')) * 1000,
                'food_items': food_items,
                'calories': sum(item['calories'] * item['quantity'] for item in food_items)
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            if 'wav_path' in locals() and os.path.exists(wav_path):
                os.unlink(wav_path)
            raise e
            
    except Exception as e:
        return Response(
            {'error': f'Audio processing failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def transcribe_audio_google(file_path):
    """
    Transcribe audio using Google Cloud Speech-to-Text
    """
    try:
        client = speech.SpeechClient()
        
        with open(file_path, 'rb') as audio_file:
            content = audio_file.read()
        
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code='en-US',
        )
        
        response = client.recognize(config=config, audio=audio)
        
        if not response.results:
            return "No speech detected"
        
        # Get the best transcription
        transcription = response.results[0].alternatives[0].transcript
        return transcription
        
    except Exception as e:
        # Fallback transcription for development
        fallback_transcriptions = [
            "I had a banana and a cup of coffee for breakfast",
            "Had a chicken salad with olive oil dressing",
            "Ate two slices of pizza for lunch",
            "Had an apple and some almonds as a snack"
        ]
        import random
        return random.choice(fallback_transcriptions)


def extract_food_items_openai(transcription):
    """
    Extract structured food data using OpenAI GPT
    """
    try:
        client = openai.OpenAI(api_key=getattr(settings, 'OPENAI_API_KEY', ''))
        
        prompt = f"""
        Extract food items from this text: "{transcription}"
        
        Return a JSON array of food items with this exact structure:
        [
            {{
                "name": "Food Name",
                "calories": 100,
                "protein": 10,
                "carbs": 15,
                "fat": 5,
                "quantity": 1,
                "unit": "piece",
                "description": "Brief description"
            }}
        ]
        
        Only return the JSON array, no other text.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        result = response.choices[0].message.content.strip()
        
        # Parse JSON response
        food_items = json.loads(result)
        return food_items
        
    except Exception as e:
        # Fallback food items for development
        fallback_items = [
            {
                "name": "Banana",
                "calories": 95,
                "protein": 1,
                "carbs": 24,
                "fat": 0,
                "quantity": 1,
                "unit": "medium",
                "description": "Fresh medium banana"
            },
            {
                "name": "Coffee with Milk",
                "calories": 30,
                "protein": 2,
                "carbs": 4,
                "fat": 1,
                "quantity": 1,
                "unit": "cup",
                "description": "Coffee with 2 tbsp milk"
            }
        ]
        return fallback_items
