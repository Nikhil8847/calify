import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  const { direction } = useLocalSearchParams();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Cast the animation to the proper type
        animation: (direction === "back"
          ? "slide_from_left"
          : "slide_from_right") as any,
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="tracking" />
    </Stack>
  );
}
