import axios from 'axios';
import { findFoodByName } from './foodDatabase';

// Default API URL - should be updated with your actual backend API endpoint
const DEFAULT_API_URL = 'http://127.0.0.1:5000/upload';

/**
 * Interface for the transcription response from the API
 */
export interface TranscriptionResponse {
  food?: string;
  calories?: number;
  meal?: string;
  quantity?: number;
  unit?: string;
  success: boolean;
  message?: string;
  details?: any;
}

/**
 * Send audio to backend for processing
 * @param audioUri The uri of the audio file to send
 * @param apiUrl Optional custom API URL
 * @returns Promise with the transcription response
 */
export async function processAudio(
  audioUri: string,
  apiUrl = DEFAULT_API_URL
): Promise<TranscriptionResponse> {
  try {
    // Create a FormData object
    const formData = new FormData();
    
    // Append the audio file - Using 'as any' to avoid TypeScript errors
    formData.append('file', {
      uri: audioUri,
      name: 'audio.wav',
      type: 'audio/wav',
    } as any);
    
    // Send the request
    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });
    
    // Return the response data
    return {
      ...response.data,
      success: true,
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    
    // Return error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Mock function to simulate API response for testing
 * @returns Mock transcription response
 */
export function mockProcessAudio(): Promise<TranscriptionResponse> {
  // Get foods from our database
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const randomMeal = meals[Math.floor(Math.random() * meals.length)];
  
  // Sample food names from our database
  const sampleFoodNames = [
    'apple', 'banana', 'chicken sandwich', 'salad', 
    'pasta', 'yogurt', 'broccoli', 'rice', 'salmon'
  ];
  
  // Pick a random food name
  const randomFoodName = sampleFoodNames[Math.floor(Math.random() * sampleFoodNames.length)];
  
  // Look up the food in our database
  const foodItem = findFoodByName(randomFoodName);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (foodItem) {
        resolve({
          success: true,
          food: foodItem.name,
          calories: foodItem.calories,
          meal: randomMeal,
          quantity: 1,
          unit: foodItem.serving,
          message: 'Successfully processed audio',
          details: {
            confidence: 0.92,
            alternatives: [`${foodItem.name} (${foodItem.calories} cal)`],
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fat: foodItem.fat,
          },
        });
      } else {
        // Fallback if the food isn't found
        resolve({
          success: true,
          food: randomFoodName,
          calories: 100,
          meal: randomMeal,
          quantity: 1,
          unit: 'serving',
          message: 'Successfully processed audio',
          details: {
            confidence: 0.7,
            alternatives: [`${randomFoodName}`],
          },
        });
      }
    }, 1000);
  });
}
