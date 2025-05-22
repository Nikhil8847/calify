import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Navigate to main app after logo is tapped
  const handleLogoPress = () => {
    router.replace("/(onboarding)/welcome");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      
      <TouchableWithoutFeedback onPress={handleLogoPress}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image
            source={require('@/assets/images/apple_logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
