import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

interface ProgressViewProps {
  label?: string;
  value: number;
  max: number;
  color?: string;
  unit?: string;
  showCircular?: boolean;
  titleText?: string;
  titleColor?: string;
}

const ProgressView: React.FC<ProgressViewProps> = ({
  label = "",
  value,
  max,
  color = "#FFFFFF",
  unit = "g",
  showCircular = false,
  titleText = "left",
  titleColor = "#FFFFFF",
}) => {
  const percent = Math.min(100, (value / max) * 100);
  const remainingValue = max - value;

  return (
    <View style={styles.container}>
      {showCircular ? (
        <View style={styles.circularContainer}>
          <CircularProgress
            value={percent}
            radius={60}
            duration={1000}
            activeStrokeWidth={3}
            inActiveStrokeWidth={3}
            inActiveStrokeColor="#FFFFFF"
            activeStrokeColor={color}
            inActiveStrokeOpacity={0.2}
            title={`${remainingValue}`}
            titleColor={titleColor}
            titleStyle={{ fontSize: 24, fontWeight: "bold" }}
            subtitle={`${unit} ${titleText}`}
            subtitleColor={titleColor}
            subtitleStyle={{ fontSize: 14 }}
            showProgressValue={false}
          />
        </View>
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.bar,
                { width: `${percent}%`, backgroundColor: color },
              ]}
            />
          </View>
          <Text style={styles.value}>{`${remainingValue}${unit} left`}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  circularContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  barBackground: {
    flex: 3,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  value: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "right",
  },
  macrosContainer: {
    display: "flex",
    width: "100%",
  },
});

export default ProgressView;
