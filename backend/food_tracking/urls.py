from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='health_check'),
    path('food-items/', views.FoodItemListView.as_view(), name='food_items'),
    path('entries/', views.CalorieEntryListCreateView.as_view(), name='calorie_entries'),
    path('entries/<int:pk>/', views.CalorieEntryDetailView.as_view(), name='calorie_entry_detail'),
    path('summary/', views.daily_summary_view, name='daily_summary'),
    path('goals/', views.DailyGoalDetailView.as_view(), name='daily_goals'),
    path('process-audio/', views.process_audio_view, name='process_audio'),
]
