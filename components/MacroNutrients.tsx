import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LineProgress from "./LineProgress";

interface MacroNutrientProps {
  protein: number;
  carbs: number;
  fat: number;
  showPercentage?: boolean;
}

const MacroNutrients: React.FC<MacroNutrientProps> = ({
  protein = 0,
  carbs = 0,
  fat = 0,
  showPercentage = true,
}) => {
  // Calculate total for percentage
  const total = protein + carbs + fat;

  // If all values are 0, show default distribution
  const proteinValue = total === 0 ? 33 : Math.round((protein / total) * 100);
  const carbsValue = total === 0 ? 33 : Math.round((carbs / total) * 100);
  const fatValue = total === 0 ? 33 : Math.round((fat / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <LineProgress
          label="protein"
          value={protein}
          max={total || 100}
          height={8}
        />
        {showPercentage && (
          <Text style={styles.percentage}>{proteinValue}%</Text>
        )}
      </View>

      <View style={styles.row}>
        <LineProgress
          label="carbs"
          value={carbs}
          max={total || 100}
          height={8}
        />
        {showPercentage && <Text style={styles.percentage}>{carbsValue}%</Text>}
      </View>

      <View style={styles.row}>
        <LineProgress label="fat" value={fat} max={total || 100} height={8} />
        {showPercentage && <Text style={styles.percentage}>{fatValue}%</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 60,
    fontSize: 12,
    color: "#555",
  },
  percentage: {
    width: 40,
    fontSize: 12,
    textAlign: "right",
    marginLeft: 8,
    color: "#555",
  },
});

export default MacroNutrients;
