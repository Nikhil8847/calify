import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { isFirstLaunch, markAppAsLaunched } from "@/utils/firstLaunch";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const firstLaunch = await isFirstLaunch();
        setIsFirstTime(firstLaunch);

        // If it's the first launch, mark it as launched for next time
        if (firstLaunch) {
          await markAppAsLaunched();
        }
      } catch (error) {
        console.error("Error in first launch check:", error);
      } finally {
        setLoading(false);
      }
    }

    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00C27A" />
      </View>
    );
  }

  // Redirect based on whether it's the first launch
  return isFirstTime ? (
    <Redirect href="/(onboarding)" />
  ) : (
    <Redirect href="/welcome" />
  );
}
