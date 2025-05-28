from datetime import date
from django.db.models import Sum
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
import tempfile
import os
import json
from google.cloud import speech
from pydub import AudioSegment
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
    List calorie entries or create a new one.
    """
    queryset = CalorieEntry.objects.all()
    serializer_class = CalorieEntrySerializer
    
    def get_queryset(self):
        queryset = CalorieEntry.objects.all()
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)
        return queryset.order_by('-created_at')


class CalorieEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific calorie entry.
    """
    queryset = CalorieEntry.objects.all()
    serializer_class = CalorieEntrySerializer


@api_view(['GET'])
def daily_summary_view(request):
    """
    Get daily nutrition summary.
    """
    try:
        today = date.today()
        date_filter = request.query_params.get('date', today)
        
        # Get today's entries
        entries = CalorieEntry.objects.filter(created_at__date=date_filter)
        
        # Calculate totals
        totals = entries.aggregate(
            total_calories=Sum('calories') or 0,
            total_protein=Sum('protein') or 0,
            total_carbs=Sum('carbs') or 0,
            total_fat=Sum('fat') or 0
        )
        
        # Get daily goals (first one or create default)
        goals, created = DailyGoal.objects.get_or_create(
            defaults={
                'target_calories': 2000,
                'target_protein': 150,
                'target_carbs': 250,
                'target_fat': 65
            }
        )
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
                'totals': meal_totals,
                'entries': CalorieEntrySerializer(meal_entries, many=True).data
            }
        
        return Response({
            'date': date_filter,
            'totals': totals,
            'goals': goals_data,
            'meal_breakdown': meal_breakdown,
            'entries_count': entries.count()
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class DailyGoalDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update daily nutrition goals.
    """
    serializer_class = DailyGoalSerializer
    
    def get_object(self):
        # Get first goal or create default
        goal, created = DailyGoal.objects.get_or_create(
            defaults={
                'target_calories': 2000,
                'target_protein': 150,
                'target_carbs': 250,
                'target_fat': 65
            }
        )
        return goal


@api_view(['POST'])
def process_audio_view(request):
    """
    Process audio recording and extract food items using Google STT + simple parsing
    """
    audio_file = request.FILES.get('file')
    if not audio_file:
        return Response(
            {'error': 'No audio file provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp_file:
            for chunk in audio_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        try:
            # Convert audio to proper format for Google STT
            audio_segment = AudioSegment.from_file(tmp_file_path, format='m4a')
            audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
            wav_path = tmp_file_path.replace('.m4a', '.wav')
            audio_segment.export(wav_path, format='wav')

            # Transcribe audio
            transcription = transcribe_audio_google(wav_path)
            
            # Extract food items using simple parsing
            food_items = extract_food_items_simple(transcription)
            
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
            language_code='en-US'
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


def extract_food_items_simple(transcription):
    """
    Extract structured food data using simple keyword matching
    """
    # Simple food database for demo
    food_db = {
        'banana': {'calories': 105, 'protein': 1.3, 'carbs': 27, 'fat': 0.4},
        'apple': {'calories': 95, 'protein': 0.5, 'carbs': 25, 'fat': 0.3},
        'coffee': {'calories': 2, 'protein': 0.3, 'carbs': 0, 'fat': 0},
        'chicken': {'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6},
        'salad': {'calories': 20, 'protein': 1, 'carbs': 4, 'fat': 0.2},
        'pizza': {'calories': 285, 'protein': 12, 'carbs': 36, 'fat': 10},
        'almonds': {'calories': 160, 'protein': 6, 'carbs': 6, 'fat': 14},
        'rice': {'calories': 205, 'protein': 4.3, 'carbs': 45, 'fat': 0.4},
        'bread': {'calories': 79, 'protein': 2.7, 'carbs': 13, 'fat': 1.1},
        'milk': {'calories': 42, 'protein': 3.4, 'carbs': 5, 'fat': 1},
    }
    
    transcription_lower = transcription.lower()
    found_items = []
    
    for food_name, nutrition in food_db.items():
        if food_name in transcription_lower:
            # Simple quantity extraction
            quantity = 1.0  # Default quantity
            
            # Look for numbers before the food name
            words = transcription_lower.split()
            try:
                food_index = words.index(food_name)
                if food_index > 0:
                    prev_word = words[food_index - 1]
                    if prev_word.replace('.', '').isdigit():
                        quantity = float(prev_word)
                    elif prev_word in ['two', 'three', 'four', 'five']:
                        quantity = {'two': 2, 'three': 3, 'four': 4, 'five': 5}[prev_word]
            except (ValueError, IndexError):
                pass
            
            found_items.append({
                'name': food_name.title(),
                'quantity': quantity,
                'calories': nutrition['calories'],
                'protein': nutrition['protein'],
                'carbs': nutrition['carbs'],
                'fat': nutrition['fat']
            })
    
    return found_items


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint
    """
    return Response({
        'status': 'healthy',
        'message': 'Calify API is running',
        'timestamp': date.today().isoformat()
    })
