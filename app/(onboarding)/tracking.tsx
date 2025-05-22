import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useRef } from "react";
import {
    Dimensions,
    Animated as RNAnimated,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateOnboarding, navigateOnboardingBack } from "@/utils/navigation";

import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

export default function EffortlessTracking() {
  const insets = useSafeAreaInsets();
  const buttonAnim = useRef(new RNAnimated.Value(1)).current;

  const handleNext = () => {
    // Button press animation
    RNAnimated.sequence([
      RNAnimated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to next page with forward animation
    setTimeout(() => {
      navigateOnboarding("goals");
    }, 200);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Use the back navigation function for backward animation
    navigateOnboardingBack("welcome");
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      {/* Illustration */}
      <Animated.View
        style={styles.illustrationContainer}
        entering={FadeIn.duration(800).delay(300)}
      >
        <Image
          source={require("@/assets/images/welcome-illustration1.png")}
          style={styles.illustration}
          contentFit="contain"
        />
      </Animated.View>

      {/* Text content */}
      <View style={styles.content}>
        <ThemedText
          type="title"
          style={styles.title}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          Effortless Tracking
        </ThemedText>

        <ThemedText
          style={styles.subtitle}
          lightColor="#A0A0A0"
          darkColor="#A0A0A0"
        >
          Easily log your meals, snacks{"\n"}and water intake
        </ThemedText>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText
            style={styles.backText}
            lightColor="#A0A0A0"
            darkColor="#A0A0A0"
          >
            Back
          </ThemedText>
        </TouchableOpacity>

        <RNAnimated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={24} color="#000000" />
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: "50%",
    gap: 20,
  },
  illustrationContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    zIndex: 10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
    color: "#F0F0F0",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: "#00C27A",
    borderColor: "#00C27A",
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: "10%",
  },
  backButton: {
    padding: 10,
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
  },
  backText: {
    fontSize: 16,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#30D07B",
    justifyContent: "center",
    alignItems: "center",
  },
});
