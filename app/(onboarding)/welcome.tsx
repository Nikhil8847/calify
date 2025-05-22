import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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

import { navigateOnboarding, navigateToMainApp } from "@/utils/navigation";

import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

export default function OnboardingWelcome() {
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

    // Navigate to next page
    setTimeout(() => {
      navigateOnboarding("tracking");
    }, 200);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigateToMainApp();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Animated.View
        style={styles.illustrationContainer}
        entering={FadeIn.duration(800).delay(300)}
      >
        <Image
          source={require("@/assets/images/welcome-illustration.png")}
          style={styles.illustration}
          contentFit="contain"
        />
      </Animated.View>

      <View style={styles.content}>
        <ThemedText
          type="title"
          style={styles.title}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          Welcome!
        </ThemedText>

        <ThemedText
          style={styles.subtitle}
          lightColor="#E0E0E0"
          darkColor="#E0E0E0"
        >
          Congratulations on taking the first step toward a healthier you!
        </ThemedText>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText
            style={styles.skipText}
            lightColor="#A0A0A0"
            darkColor="#A0A0A0"
          >
            Skip
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
  decorativeBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundShape: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: "rgba(0, 194, 122, 0.15)",
    transform: [{ scaleX: 1.2 }],
  },
  confetti: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  confettiPink: {
    backgroundColor: "#FF6B9E",
  },
  confettiGreen: {
    backgroundColor: "#00C27A",
  },
  confettiPurple: {
    backgroundColor: "#A259FF",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
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
  skipButton: {
    padding: 10,
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00C27A",
    justifyContent: "center",
    alignItems: "center",
  },
});
