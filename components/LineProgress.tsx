import React from "react";
import { StyleSheet, View } from "react-native";

interface LineProgressProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  label: string;
}

const LineProgress: React.FC<LineProgressProps> = ({
  value,
  max,
  color = "#30D07B",
  height = 8,
  backgroundColor = "#E0E0E0",
  borderRadius = 4,
}) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View
      style={[styles.background, { height, backgroundColor, borderRadius }]}
    >
      <View
        style={[
          styles.bar,
          {
            width: `${percent}%`,
            backgroundColor: color,
            borderRadius,
            height: "100%",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
  },
});

export default LineProgress;
