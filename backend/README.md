# Calorie Tracker Backend

A clean, simple Django REST API for calorie tracking with email/password authentication.

## Features

- ✅ **Simple Email/Password Authentication**

  - User registration with email
  - Login/logout with token-based authentication
  - Protected API endpoints
  - User profile management

- ✅ **Food Tracking**

  - Comprehensive food database with nutritional information
  - Add calorie entries with portion sizes
  - Daily nutrition summary with goals tracking
  - Search food items
  - Meal categorization (breakfast, lunch, dinner, snack)

- ✅ **RESTful API**
  - Token-based authentication
  - CORS enabled for frontend integration
  - JSON responses
  - Proper HTTP status codes

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user (requires token)
- `GET /api/auth/profile/` - Get user profile (requires token)

### Food Tracking

- `GET /api/food/items/` - List all food items (supports search with `?search=query`)
- `GET /api/food/entries/` - List user's calorie entries (supports date filter with `?date=YYYY-MM-DD`)
- `POST /api/food/entries/` - Add new calorie entry
- `GET /api/food/entries/<id>/` - Get specific calorie entry
- `PUT /api/food/entries/<id>/` - Update calorie entry
- `DELETE /api/food/entries/<id>/` - Delete calorie entry
- `GET /api/food/summary/` - Get daily nutrition summary (supports date filter)
- `GET /api/food/goals/` - Get user's daily nutrition goals
- `PUT /api/food/goals/` - Update user's daily nutrition goals

## Setup Instructions

1. **Create virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

4. **Populate sample food data:**

   ```bash
   python manage.py populate_food_db
   ```

5. **Start development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://127.0.0.1:8000/api/`

## Testing

Run the included test scripts to verify functionality:

```bash
# Test authentication endpoints
python test_api.py

# Test food tracking endpoints
python test_food_tracking.py
```

## Example Usage

### Register a new user:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "securepassword", "first_name": "John", "last_name": "Doe"}'
```

### Login:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

### Add a calorie entry (requires token):

```bash
curl -X POST http://127.0.0.1:8000/api/food/entries/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Token YOUR_TOKEN_HERE" \\
  -d '{"food_item": 1, "quantity_grams": 100, "meal_type": "breakfast"}'
```

## Database Schema

- **User**: Built-in Django user model with email as username
- **FoodItem**: Food database with nutritional information per 100g
- **CalorieEntry**: User's food consumption records with calculated nutrition
- **DailyGoal**: User's daily nutrition targets

## Security Features

- Token-based authentication
- Password validation
- CORS protection
- Protected endpoints requiring authentication
- Input validation and sanitization
