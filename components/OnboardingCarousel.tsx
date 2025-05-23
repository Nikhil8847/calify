import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Animated as RNAnimated,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// No need to import navigation utilities as we'll use the provided onComplete callback

import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

export type OnboardingScreen = {
  id: string;
  content: ReactNode;
  title: string;
  subtitle: string;
  image: any; // Image source
};

type OnboardingCarouselProps = {
  screens: OnboardingScreen[];
  onComplete?: () => void;
};

export default function OnboardingCarousel({
  screens,
  onComplete = () => console.log("Onboarding complete"),
}: OnboardingCarouselProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const buttonAnim = useRef(new RNAnimated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastScreen = currentIndex === screens.length - 1;

  const handleNext = () => {
    // Button press animation
    RNAnimated.sequence([
      RNAnimated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 20,
        useNativeDriver: true,
      }),
      RNAnimated.timing(buttonAnim, {
        toValue: 1,
        duration: 20,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if on last screen
    if (isLastScreen) {
      setTimeout(() => {
        onComplete();
      }, 200);
      return;
    }

    // Scroll to next screen
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }, 200);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll to previous screen
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: OnboardingScreen }) => {
    return (
      <View style={styles.slide}>
        {/* Screen content */}
        <Animated.View
          style={styles.illustrationContainer}
          // Using the reanimated animation here
          entering={FadeIn.duration(300)}
        >
          {item.image}
        </Animated.View>

        {/* Text content */}
        <View style={styles.content}>
          <ThemedText
            type="title"
            style={styles.title}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            {item.title}
          </ThemedText>

          <ThemedText
            style={styles.subtitle}
            lightColor="#A0A0A0"
            darkColor="#A0A0A0"
          >
            {item.subtitle}
          </ThemedText>
        </View>

        {/* Custom content from screen config */}
        {item.content}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={false} // Disable manual scrolling for controlled navigation
      />

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : undefined,
            ]}
          />
        ))}
      </View>

      {/* Bottom actions */}
      <View style={styles.actions}>
        {currentIndex > 0 ? (
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
        ) : (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedText
              style={styles.backText}
              lightColor="#A0A0A0"
              darkColor="#A0A0A0"
            >
              Skip
            </ThemedText>
          </TouchableOpacity>
        )}

        <RNAnimated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLastScreen ? "checkmark" : "arrow-forward"}
              size={24}
              color="#000000"
            />
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
  },
  slide: {
    width,
    flex: 1,
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
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
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
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
