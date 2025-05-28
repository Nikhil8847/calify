from django.contrib import admin
from .models import FoodItem, CalorieEntry, DailyGoal


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'calories_per_100g', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(CalorieEntry)
class CalorieEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'food_item', 'quantity_grams', 'calories', 'meal_type', 'created_at')
    list_filter = ('meal_type', 'created_at', 'food_item')
    search_fields = ('user__username', 'user__email', 'food_item__name')
    ordering = ('-created_at',)
    readonly_fields = ('calories', 'protein', 'carbs', 'fat')


@admin.register(DailyGoal)
class DailyGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_calories', 'target_protein', 'target_carbs', 'target_fat', 'updated_at')
    search_fields = ('user__username', 'user__email')
    ordering = ('user__username',)
