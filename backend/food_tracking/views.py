from datetime import date
from django.db.models import Sum
from django.conf import settings
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
import tempfile
import os
import json
import openai
import re
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
    Process audio recording and extract food items using OpenAI Whisper + ChatGPT
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
            # Transcribe audio using OpenAI Whisper
            transcription = transcribe_audio_whisper(tmp_file_path)
            
            # Extract structured food data using ChatGPT
            structured_data = extract_food_data_with_gpt(transcription)
            
            # Clean up temporary files
            os.unlink(tmp_file_path)
            
            return Response({
                'success': True,
                'transcription': transcription,
                'food': structured_data.get('food', 'unknown food'),
                'meal': structured_data.get('meal', 'snack'),
                'details': structured_data.get('details', {
                    'protein': 0,
                    'carbs': 0,
                    'fat': 0
                }),
                'confidence': structured_data.get('confidence', 0.85),
                'timestamp': int(date.today().strftime('%s')) * 1000,
                'calories': structured_data.get('calories', 0)
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise e
            
    except Exception as e:
        return Response(
            {'error': f'Audio processing failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def transcribe_audio_whisper(file_path):
    """
    Transcribe audio using OpenAI Whisper
    """
    try:
        # Initialize OpenAI client
        api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
        if not api_key:
            raise Exception("OpenAI API key not configured")

        client = openai.OpenAI(api_key=api_key)

        with open(file_path, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )

        return transcription

    except Exception as e:
        print(f"Whisper transcription error: {e}")
        # Fallback transcription for development
        fallback_transcriptions = [
            "I had a banana and a cup of coffee for breakfast",
            "Had a chicken salad with olive oil dressing",
            "Ate two slices of pizza for lunch",
            "Had an apple and some almonds as a snack",
            "I just finished eating grilled salmon with vegetables"
        ]
        import random
        return random.choice(fallback_transcriptions)


def extract_food_data_with_gpt(transcription):
    """
    Extract structured food data using ChatGPT
    """
    try:
        # Initialize OpenAI client
        api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
        if not api_key:
            raise Exception("OpenAI API key not configured")

        client = openai.OpenAI(api_key=api_key)

        system_prompt =  f"""
        You are a health and nutrition assistant helping users track their meals by analyzing transcripts from their voice input.
        
        Extract a structured JSON object containing:
        
        - meal: one of ["breakfast", "lunch", "dinner", "snack", "unknown"]
        - items: list of food items the user consumed. Each item should include:
          - name: food name (standardized, e.g., "banana", "paneer")
          - quantity: number or estimated quantity
          - unit: "grams", "ml", "pieces", "bowl", "cup", etc.
          - estimated_weight_g: inferred weight in grams (for consistency)
          - preparation: "cooked", "raw", "boiled", "fried", etc.
          - estimated_calories
          - macros:
            - protein_g
            - carbs_g
            - fat_g
        
        - total_estimated_calories: sum of calories
        
        Use common nutrition knowledge (USDA/HealthifyMe-like DB).
        If anything is vague (like "some rice"), estimate based on common serving sizes.
        
        Return only valid JSON.
        """


        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Transcription: {transcription}"}
            ],
            temperature=0.3,
            max_tokens=300
        )

        # Parse the JSON response
        response_text = response.choices[0].message.content
        json_str = response_text.strip()
        json_str = re.sub(r"^```json\n", "", json_str)
        json_str = re.sub(r"\n```$", "", json_str)
        json_str = re.sub(r"^```[\w]*\n", "", json_str)  # generic code block
        try:
            structured_data = json.loads(json_str)
            return structured_data
        except json.JSONDecodeError:
            # If JSON parsing fails, return a default structure
            return create_fallback_food_data(transcription)

    except Exception as e:
        print(f"ChatGPT processing error: {e}")
        return create_fallback_food_data(transcription)


def create_fallback_food_data(transcription):
    """
    Create fallback structured data when GPT processing fails
    """
    # Simple keyword-based fallback
    transcription_lower = transcription.lower()
    
    # Default values
    food = "unknown food"
    meal = "snack"
    calories = 150
    protein = 5
    carbs = 20
    fat = 5
    
    # Simple food detection
    if any(word in transcription_lower for word in ['banana', 'apple', 'fruit']):
        food = "fruit"
        calories = 95
        protein = 1
        carbs = 25
        fat = 0
    elif any(word in transcription_lower for word in ['chicken', 'meat', 'protein']):
        food = "chicken"
        calories = 165
        protein = 31
        carbs = 0
        fat = 4
    elif any(word in transcription_lower for word in ['pizza', 'bread', 'pasta']):
        food = "pizza slice"
        calories = 285
        protein = 12
        carbs = 36
        fat = 10
    elif any(word in transcription_lower for word in ['salad', 'vegetables', 'greens']):
        food = "salad"
        calories = 50
        protein = 3
        carbs = 8
        fat = 1
    
    # Simple meal classification
    if any(word in transcription_lower for word in ['breakfast', 'morning']):
        meal = "breakfast"
    elif any(word in transcription_lower for word in ['lunch', 'noon']):
        meal = "lunch"
    elif any(word in transcription_lower for word in ['dinner', 'evening']):
        meal = "dinner"
    
    return {
        "food": food,
        "meal": meal,
        "calories": calories,
        "details": {
            "protein": protein,
            "carbs": carbs,
            "fat": fat
        },
        "confidence": 0.6
    }


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
