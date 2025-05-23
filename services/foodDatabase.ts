/**
 * Food database service for Calify app
 * This provides nutrition data for common food items
 */

export interface FoodItem {
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  serving: string; // serving size description
  category: string;
}

// Database of common food items with nutrition info
const foodDatabase: FoodItem[] = [
  {
    name: "apple",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    serving: "1 medium (182g)",
    category: "fruits",
  },
  {
    name: "banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    serving: "1 medium (118g)",
    category: "fruits",
  },
  {
    name: "orange",
    calories: 62,
    protein: 1.2,
    carbs: 15.4,
    fat: 0.2,
    serving: "1 medium (131g)",
    category: "fruits",
  },
  {
    name: "grilled chicken breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: "100g",
    category: "protein",
  },
  {
    name: "salmon",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    serving: "100g",
    category: "protein",
  },
  {
    name: "chicken sandwich",
    calories: 350,
    protein: 28,
    carbs: 35,
    fat: 12,
    serving: "1 sandwich",
    category: "meal",
  },
  {
    name: "rice",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    serving: "100g cooked",
    category: "grains",
  },
  {
    name: "bread",
    calories: 75,
    protein: 3,
    carbs: 13,
    fat: 1,
    serving: "1 slice",
    category: "grains",
  },
  {
    name: "pasta",
    calories: 200,
    protein: 7,
    carbs: 42,
    fat: 1.2,
    serving: "100g cooked",
    category: "grains",
  },
  {
    name: "milk",
    calories: 122,
    protein: 8.1,
    carbs: 12,
    fat: 4.8,
    serving: "240ml",
    category: "dairy",
  },
  {
    name: "yogurt",
    calories: 150,
    protein: 12,
    carbs: 17,
    fat: 3.8,
    serving: "170g",
    category: "dairy",
  },
  {
    name: "cheese",
    calories: 113,
    protein: 7.1,
    carbs: 0.9,
    fat: 9.4,
    serving: "30g",
    category: "dairy",
  },
  {
    name: "salad",
    calories: 120,
    protein: 3,
    carbs: 8,
    fat: 9,
    serving: "1 bowl",
    category: "vegetables",
  },
  {
    name: "broccoli",
    calories: 55,
    protein: 3.7,
    carbs: 11.2,
    fat: 0.6,
    serving: "100g cooked",
    category: "vegetables",
  },
  {
    name: "eggs",
    calories: 78,
    protein: 6,
    carbs: 0.6,
    fat: 5.3,
    serving: "1 large egg",
    category: "protein",
  },
  {
    name: "chocolate",
    calories: 150,
    protein: 2,
    carbs: 16,
    fat: 9,
    serving: "30g",
    category: "snacks",
  },
  {
    name: "avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    serving: "1/2 avocado",
    category: "fruits",
  },
  {
    name: "almonds",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    serving: "30g (small handful)",
    category: "snacks",
  },
  {
    name: "oatmeal",
    calories: 150,
    protein: 5.6,
    carbs: 27,
    fat: 2.5,
    serving: "1 cup cooked",
    category: "grains",
  }
];

/**
 * Find a food item in the database by name
 * 
 * @param name Food name to search for
 * @returns Food item if found, or null if not found
 */
export function findFoodByName(name: string): FoodItem | null {
  // Convert the search term to lowercase for case-insensitive search
  const normalizedName = name.trim().toLowerCase();
  
  // Find an exact match
  const exactMatch = foodDatabase.find(item => 
    item.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // If no exact match, look for partial matches
  const partialMatch = foodDatabase.find(item => 
    item.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(item.name.toLowerCase())
  );
  
  return partialMatch || null;
}

/**
 * Get all foods in a specific category
 * 
 * @param category Category to filter by
 * @returns Array of food items in the specified category
 */
export function getFoodsByCategory(category: string): FoodItem[] {
  return foodDatabase.filter(
    item => item.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all food categories
 * 
 * @returns Array of unique category names
 */
export function getFoodCategories(): string[] {
  const categories = foodDatabase.map(item => item.category);
  return [...new Set(categories)]; // Remove duplicates with Set
}

/**
 * Get all foods in the database
 * 
 * @returns Complete food database
 */
export function getAllFoods(): FoodItem[] {
  return [...foodDatabase];
}

/**
 * Calculate macronutrient breakdown from calories
 * 
 * @param calories Total calories
 * @param protein Protein in grams
 * @param carbs Carbs in grams
 * @param fat Fat in grams
 * @returns Object with percentage breakdown
 */
export function calculateMacroPercentages(calories: number, protein: number, carbs: number, fat: number) {
  // Calculate calories from macronutrients
  const proteinCals = protein * 4;  // 4 calories per gram of protein
  const carbsCals = carbs * 4;      // 4 calories per gram of carbs
  const fatCals = fat * 9;          // 9 calories per gram of fat
  
  // Calculate percentages
  return {
    protein: Math.round((proteinCals / calories) * 100),
    carbs: Math.round((carbsCals / calories) * 100),
    fat: Math.round((fatCals / calories) * 100)
  };
}
