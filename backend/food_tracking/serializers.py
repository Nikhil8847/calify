from rest_framework import serializers
from .models import FoodItem, CalorieEntry, DailyGoal


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'


class CalorieEntrySerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    
    class Meta:
        model = CalorieEntry
        fields = ['id', 'food_item', 'food_item_name', 'quantity_grams', 'calories', 
                 'protein', 'carbs', 'fat', 'meal_type', 'created_at']
        read_only_fields = ['calories', 'protein', 'carbs', 'fat']


class DailyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyGoal
        fields = ['target_calories', 'target_protein', 'target_carbs', 'target_fat']
