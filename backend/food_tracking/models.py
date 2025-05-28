from django.db import models


class FoodItem(models.Model):
    name = models.CharField(max_length=255)
    calories_per_100g = models.DecimalField(max_digits=8, decimal_places=2)
    protein_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbs_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fat_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class CalorieEntry(models.Model):
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity_grams = models.DecimalField(max_digits=8, decimal_places=2)
    calories = models.DecimalField(max_digits=8, decimal_places=2)
    protein = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbs = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fat = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    meal_type = models.CharField(
        max_length=20,
        choices=[
            ('breakfast', 'Breakfast'),
            ('lunch', 'Lunch'),
            ('dinner', 'Dinner'),
            ('snack', 'Snack'),
        ],
        default='snack'
    )
    
    def save(self, *args, **kwargs):
        # Calculate nutritional values based on quantity
        multiplier = self.quantity_grams / 100
        self.calories = self.food_item.calories_per_100g * multiplier
        self.protein = self.food_item.protein_per_100g * multiplier
        self.carbs = self.food_item.carbs_per_100g * multiplier
        self.fat = self.food_item.fat_per_100g * multiplier
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.food_item.name} ({self.quantity_grams}g)"
    
    class Meta:
        ordering = ['-created_at']


class DailyGoal(models.Model):
    target_calories = models.DecimalField(max_digits=8, decimal_places=2, default=2000)
    target_protein = models.DecimalField(max_digits=8, decimal_places=2, default=150)
    target_carbs = models.DecimalField(max_digits=8, decimal_places=2, default=250)
    target_fat = models.DecimalField(max_digits=8, decimal_places=2, default=65)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Daily Goals - {self.target_calories} calories"
