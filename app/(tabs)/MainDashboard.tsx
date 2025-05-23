import Instructions from "@/components/Instructions";
import MacroNutrients from "@/components/MacroNutrients";
import ProgressView from "@/components/ProgressView/ProgressView";
import VoiceButton from "@/components/VoiceButton";
import { TranscriptionResponse } from "@/services/audioService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define type for meal data structure
type MealData = {
  items: string[];
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

// Define type for all meals
type MealsState = {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  snack: MealData;
  [key: string]: MealData; // Index signature for string keys
};

// Define macronutrient tracking
type MacroData = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function MainDashboard() {
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [caloriesConsumed, setCaloriesConsumed] = useState(325);
  const [dailyGoal] = useState(1200);
  const [showInstructions, setShowInstructions] = useState(false);
  const [macros, setMacros] = useState<MacroData>({
    protein: 20, // grams
    carbs: 30, // grams
    fat: 12, // grams
  });
  const [meals, setMeals] = useState<MealsState>({
    breakfast: {
      items: ["Grilled Avocado, Homemade Yogurt"],
      calories: 420,
      protein: 15,
      carbs: 25,
      fat: 10,
    },
    lunch: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
    dinner: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
    snack: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  });

  const handleStartRecording = () => {
    console.log("Started recording voice...");
    // UI feedback is handled by the VoiceButton component
  };

  // Function to toggle instructions modal
  const toggleInstructions = () => {
    setShowInstructions((prev) => !prev);
  };

  const handleStopRecording = (transcriptionData?: TranscriptionResponse) => {
    console.log("Stopped recording voice...", transcriptionData);
    setIsProcessingVoice(true);

    if (transcriptionData && transcriptionData.success) {
      // Process the transcription data after a short delay
      setTimeout(() => {
        setIsProcessingVoice(false);

        // Extract data from the transcription
        const food = transcriptionData.food || "food item";
        const calories = transcriptionData.calories || 0;
        const mealType = (transcriptionData.meal || "breakfast").toLowerCase();

        // Extract macronutrients if available
        const protein = transcriptionData.details?.protein || 0;
        const carbs = transcriptionData.details?.carbs || 0;
        const fat = transcriptionData.details?.fat || 0;

        // Update the meals state with the new food item
        setMeals((prevMeals) => {
          const updatedMeals = { ...prevMeals };

          // Add the new food item to the specified meal
          if (updatedMeals[mealType]) {
            updatedMeals[mealType].items = [
              ...updatedMeals[mealType].items,
              food,
            ];
            updatedMeals[mealType].calories += calories;
            updatedMeals[mealType].protein =
              (updatedMeals[mealType].protein || 0) + protein;
            updatedMeals[mealType].carbs =
              (updatedMeals[mealType].carbs || 0) + carbs;
            updatedMeals[mealType].fat =
              (updatedMeals[mealType].fat || 0) + fat;
          }

          return updatedMeals;
        });

        // Update total calories consumed
        setCaloriesConsumed((prev) => prev + calories);

        // Update macronutrients
        setMacros((prev) => ({
          protein: prev.protein + protein,
          carbs: prev.carbs + carbs,
          fat: prev.fat + fat,
        }));

        // Show confirmation to the user
        Alert.alert(
          "Food Added",
          `Added ${food} to your ${mealType}: ${calories} calories`
        );
      }, 1000);
    } else {
      // Handle case when transcription data is not available or unsuccessful
      setTimeout(() => {
        setIsProcessingVoice(false);
        Alert.alert(
          "Voice Processing",
          "I couldn't understand that. Please try again."
        );
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}

      <View style={styles.header}>
        <Image
          source={require("@/assets/images/apple_logo.png")}
          style={styles.avatar}
        />
        <Text style={styles.title}>My Plan</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="camera" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calorie Summary Card */}
      <View style={styles.calorieCard}>
        <ProgressView
          value={caloriesConsumed}
          max={dailyGoal}
          color="#30D07B"
          unit="cals"
          showCircular={true}
          titleText="left"
          titleColor="#FFFFFF"
        />
        <View style={styles.voiceContainer}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={toggleInstructions}
          >
            <Ionicons name="help-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.metricsRow}>
          <Text style={styles.metric}>Eaten: {caloriesConsumed}</Text>
          <Text style={styles.metric}>Burned: 122</Text>
        </View>

        {/* Macro Nutrients */}
        <View style={styles.macrosContainer}>
          <MacroNutrients
            protein={macros.protein}
            carbs={macros.carbs}
            fat={macros.fat}
            showPercentage={false}
          />
        </View>
      </View>

      {/* Voice Instructions Modal */}
      <Instructions visible={showInstructions} onClose={toggleInstructions} />

      {/* Date Picker */}
      <View style={styles.datePicker}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.dateLabel}>Today, 16 Jul</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Food Diary Section */}
      <ScrollView style={styles.foodDiary}>
        <Text style={styles.sectionTitle}>Food Diary</Text>

        {/* Breakfast */}
        <View style={styles.mealCard}>
          <Ionicons name="cafe-outline" size={24} color="#000" />
          <View style={styles.mealDetails}>
            <Text style={styles.mealTitle}>Breakfast</Text>
            {meals.breakfast.items.length > 0 ? (
              <>
                <Text style={styles.mealSubtitle}>
                  {meals.breakfast.items.join(", ")}
                </Text>
                <Text style={styles.mealSummary}>
                  {meals.breakfast.calories} kcal • P: {meals.breakfast.protein}
                  g • C: {meals.breakfast.carbs}g • F: {meals.breakfast.fat}g
                </Text>
              </>
            ) : (
              <Text style={styles.mealSubtitle}>No items added yet</Text>
            )}
          </View>
          <TouchableOpacity>
            <Ionicons name="add-circle" size={24} color="#30D07B" />
          </TouchableOpacity>
        </View>

        {/* Lunch */}
        <View style={styles.mealCard}>
          <Ionicons name="restaurant-outline" size={24} color="#000" />
          <View style={styles.mealDetails}>
            <Text style={styles.mealTitle}>Lunch</Text>
            {meals.lunch.items.length > 0 ? (
              <>
                <Text style={styles.mealSubtitle}>
                  {meals.lunch.items.join(", ")}
                </Text>
                <Text style={styles.mealSummary}>
                  {meals.lunch.calories} kcal • P: {meals.lunch.protein}g • C:{" "}
                  {meals.lunch.carbs}g • F: {meals.lunch.fat}g
                </Text>
              </>
            ) : (
              <Text style={styles.mealSubtitle}>No items added yet</Text>
            )}
          </View>
          <TouchableOpacity>
            <Ionicons name="add-circle" size={24} color="#30D07B" />
          </TouchableOpacity>
        </View>

        {/* Dinner */}
        <View style={styles.mealCard}>
          <Ionicons name="moon-outline" size={24} color="#000" />
          <View style={styles.mealDetails}>
            <Text style={styles.mealTitle}>Dinner</Text>
            {meals.dinner.items.length > 0 ? (
              <>
                <Text style={styles.mealSubtitle}>
                  {meals.dinner.items.join(", ")}
                </Text>
                <Text style={styles.mealSummary}>
                  {meals.dinner.calories} kcal • P: {meals.dinner.protein}g • C:{" "}
                  {meals.dinner.carbs}g • F: {meals.dinner.fat}g
                </Text>
              </>
            ) : (
              <Text style={styles.mealSubtitle}>No items added yet</Text>
            )}
          </View>
          <TouchableOpacity>
            <Ionicons name="add-circle" size={24} color="#30D07B" />
          </TouchableOpacity>
        </View>

        {/* Snacks */}
        <View style={styles.mealCard}>
          <Ionicons name="pizza-outline" size={24} color="#000" />
          <View style={styles.mealDetails}>
            <Text style={styles.mealTitle}>Snacks</Text>
            {meals.snack.items.length > 0 ? (
              <>
                <Text style={styles.mealSubtitle}>
                  {meals.snack.items.join(", ")}
                </Text>
                <Text style={styles.mealSummary}>
                  {meals.snack.calories} kcal • P: {meals.snack.protein}g • C:{" "}
                  {meals.snack.carbs}g • F: {meals.snack.fat}g
                </Text>
              </>
            ) : (
              <Text style={styles.mealSubtitle}>No items added yet</Text>
            )}
          </View>
          <TouchableOpacity>
            <Ionicons name="add-circle" size={24} color="#30D07B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <VoiceButton
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isProcessing={isProcessingVoice}
        size={65}
      />
      {/* Bottom Navigation Bar */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="book" size={24} color="#30D07B" />
          <Text style={styles.navLabel}>Diary</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="clipboard" size={24} color="#000" />
          <Text style={styles.navLabel}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="compass" size={24} color="#000" />
          <Text style={styles.navLabel}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="barbell" size={24} color="#000" />
          <Text style={styles.navLabel}>Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="stats-chart" size={24} color="#000" />
          <Text style={styles.navLabel}>Progress</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  calorieCard: {
    backgroundColor: "#30D07B",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    alignItems: "center",
  },
  caloriesLeft: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  caloriesLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  voiceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  helpButton: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  metric: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  macrosContainer: {
    marginTop: 16,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    padding: 12,
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  foodDiary: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  mealDetails: {
    flex: 1,
    marginLeft: 16,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mealSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  mealSummary: {
    fontSize: 12,
    color: "#999999",
  },
  voiceButtonContainer: {
    padding: 16,
    alignItems: "center",
  },
  bottomNav: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
});
