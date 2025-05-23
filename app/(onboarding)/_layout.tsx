import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Main onboarding carousel screen */}
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
