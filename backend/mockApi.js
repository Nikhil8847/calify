// This is a simple mock implementation of a speech-to-text backend
// It can be used for testing or as a template for a real backend

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 5000;

// Enable CORS for React Native app
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Mock data for random food items
const mockFoodData = [
  { food: 'apple', calories: 95, meal: 'breakfast' },
  { food: 'banana', calories: 105, meal: 'breakfast' },
  { food: 'chicken sandwich', calories: 350, meal: 'lunch' },
  { food: 'salad', calories: 120, meal: 'lunch' },
  { food: 'pasta', calories: 420, meal: 'dinner' },
  { food: 'yogurt', calories: 150, meal: 'snack' },
];

// Mock food detection endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  // In a real implementation, this would process the audio file
  // and extract information using a speech-to-text service
  
  // For this mock implementation, we'll just return a random food item
  const randomFood = mockFoodData[Math.floor(Math.random() * mockFoodData.length)];
  
  // Log that we received a file
  console.log('Received file:', req.file?.filename);
  
  // Return mock response
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Successfully processed audio',
      ...randomFood,
      details: {
        food: randomFood.food,
        calories: randomFood.calories,
        meal: randomFood.meal,
        confidence: Math.random().toFixed(2),
      },
    });
  }, 1000); // Add a delay to simulate processing time
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Mock API server listening at http://localhost:${port}`);
  });
}

export default app;
