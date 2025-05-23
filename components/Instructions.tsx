import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InstructionsProps {
  onClose?: () => void;
  visible?: boolean;
}

const Instructions: React.FC<InstructionsProps> = ({
  onClose,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={24} color="#999" />
        </TouchableOpacity>

        <Text style={styles.title}>Voice Commands</Text>

        <View style={styles.instruction}>
          <Ionicons name="mic" size={24} color="#30D07B" style={styles.icon} />
          <View>
            <Text style={styles.instructionTitle}>How to add food</Text>
            <Text style={styles.instructionText}>
              Tap the microphone button and speak clearly. It will automatically
              stop recording after 2 seconds of silence.
            </Text>
            <Text style={styles.instructionText}>
              You can also tap again to stop recording manually.
            </Text>
          </View>
        </View>

        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Try saying:</Text>
          <Text style={styles.example}>"Add an apple to breakfast"</Text>
          <Text style={styles.example}>"Add chicken sandwich to lunch"</Text>
          <Text style={styles.example}>"Add pasta to dinner"</Text>
        </View>

        <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
          <Text style={styles.gotItText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instruction: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
  },
  examples: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  gotItButton: {
    backgroundColor: "#30D07B",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  gotItText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default Instructions;
