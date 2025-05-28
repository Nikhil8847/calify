from django.core.management.base import BaseCommand
from food_tracking.models import FoodItem


class Command(BaseCommand):
    help = 'Populate the database with sample food items'

    def handle(self, *args, **options):
        # Sample food data
        food_items = [
            # Fruits
            {'name': 'Apple', 'calories_per_100g': 52, 'protein_per_100g': 0.3, 'carbs_per_100g': 14, 'fat_per_100g': 0.2},
            {'name': 'Banana', 'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3},
            {'name': 'Orange', 'calories_per_100g': 47, 'protein_per_100g': 0.9, 'carbs_per_100g': 12, 'fat_per_100g': 0.1},
            
            # Vegetables
            {'name': 'Broccoli', 'calories_per_100g': 34, 'protein_per_100g': 2.8, 'carbs_per_100g': 7, 'fat_per_100g': 0.4},
            {'name': 'Spinach', 'calories_per_100g': 23, 'protein_per_100g': 2.9, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4},
            {'name': 'Carrot', 'calories_per_100g': 41, 'protein_per_100g': 0.9, 'carbs_per_100g': 10, 'fat_per_100g': 0.2},
            
            # Proteins
            {'name': 'Chicken Breast', 'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6},
            {'name': 'Salmon', 'calories_per_100g': 208, 'protein_per_100g': 25, 'carbs_per_100g': 0, 'fat_per_100g': 12},
            {'name': 'Eggs', 'calories_per_100g': 155, 'protein_per_100g': 13, 'carbs_per_100g': 1.1, 'fat_per_100g': 11},
            
            # Grains
            {'name': 'Brown Rice', 'calories_per_100g': 111, 'protein_per_100g': 2.6, 'carbs_per_100g': 23, 'fat_per_100g': 0.9},
            {'name': 'Oats', 'calories_per_100g': 389, 'protein_per_100g': 17, 'carbs_per_100g': 66, 'fat_per_100g': 6.9},
            {'name': 'Quinoa', 'calories_per_100g': 120, 'protein_per_100g': 4.4, 'carbs_per_100g': 22, 'fat_per_100g': 1.9},
            
            # Dairy
            {'name': 'Greek Yogurt', 'calories_per_100g': 59, 'protein_per_100g': 10, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4},
            {'name': 'Milk (2%)', 'calories_per_100g': 50, 'protein_per_100g': 3.4, 'carbs_per_100g': 5, 'fat_per_100g': 2},
            {'name': 'Cheddar Cheese', 'calories_per_100g': 403, 'protein_per_100g': 25, 'carbs_per_100g': 1.3, 'fat_per_100g': 33},
            
            # Nuts and Seeds
            {'name': 'Almonds', 'calories_per_100g': 579, 'protein_per_100g': 21, 'carbs_per_100g': 22, 'fat_per_100g': 50},
            {'name': 'Walnuts', 'calories_per_100g': 654, 'protein_per_100g': 15, 'carbs_per_100g': 14, 'fat_per_100g': 65},
            {'name': 'Chia Seeds', 'calories_per_100g': 486, 'protein_per_100g': 17, 'carbs_per_100g': 42, 'fat_per_100g': 31},
        ]

        for item_data in food_items:
            food_item, created = FoodItem.objects.get_or_create(
                name=item_data['name'],
                defaults=item_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created food item: {food_item.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Food item already exists: {food_item.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated food database!')
        )
