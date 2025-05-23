import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import OnboardingCarousel, {
  OnboardingScreen,
} from "@/components/OnboardingCarousel";

const styles = StyleSheet.create({
  illustration: {
    width: 250,
    height: 250,
    zIndex: 10,
  },
});

// Define the onboarding screens
const screens: OnboardingScreen[] = [
  {
    id: "welcome",
    title: "Welcome to Calify",
    subtitle: "Track your fitness journey\nwith ease and precision",
    image: (
      <Image
        source={require("@/assets/images/welcome-illustration.png")}
        style={styles.illustration}
        contentFit="contain"
      />
    ),
    content: <View />,
  },
  {
    id: "tracking",
    title: "Effortless Tracking",
    subtitle: "Keep track of your workouts\nwith minimal effort",
    image: (
      <Image
        source={require("@/assets/images/welcome-illustration1.png")}
        style={styles.illustration}
        contentFit="contain"
      />
    ),
    content: <View />,
  },
  {
    id: "goals",
    title: "Goal Setting",
    subtitle: "Set realistic goal and watch\nyour progress unfold",
    image: (
      <Image
        source={require("@/assets/images/welcome-illustration2.png")}
        style={styles.illustration}
        contentFit="contain"
      />
    ),
    content: <View />,
  },
];

export default function OnboardingCarouselScreen() {
  // Use router directly for navigation to main app
  const handleComplete = () => {
    router.replace("/(tabs)");
  };

  return <OnboardingCarousel screens={screens} onComplete={handleComplete} />;
}
