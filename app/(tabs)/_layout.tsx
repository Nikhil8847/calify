import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import VoiceButton from "@/components/VoiceButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="MainDashboard"
        options={{
          title: "Diary",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="voiceButton"
        options={{
          title: "voiceButton",
          tabBarButton: (props) => <VoiceButton />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clipboard" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
