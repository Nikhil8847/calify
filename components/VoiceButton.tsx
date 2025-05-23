import {
  mockProcessAudio,
  TranscriptionResponse,
} from "@/services/audioService";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface VoiceButtonProps {
  onStartRecording?: () => void;
  onStopRecording?: (transcription?: TranscriptionResponse) => void;
  isProcessing?: boolean;
  size?: number;
  apiUrl?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onStartRecording,
  onStopRecording,
  isProcessing = false,
  size = 100,
  apiUrl = "http://127.0.0.1:5000/upload",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [animation] = useState(new Animated.Value(1));
  const [transcription, setTranscription] =
    useState<TranscriptionResponse | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [autoStopEnabled, setAutoStopEnabled] = useState(true);

  // Path where recording will be saved
  const recordingPath = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}audio.m4a`
    : "audio.m4a";

  // Initialize the audio recorder with recording options
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    // This is the status listener that gets called when recording status changes
    console.log("Recording status changed:", status);

    if (status.isFinished) {
      console.log("Recording finished, file available at:", status.url);
    }

    if (status.hasError) {
      console.error("Recording error:", status.error);
    }
  });

  // Track metering levels for silence detection
  const [meterLevel, setMeterLevel] = useState<number>(0);

  // Regular interval to check recording status (for metering)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording) {
      interval = setInterval(() => {
        const status = recorder.getStatus();
        if (status.metering !== undefined) {
          setMeterLevel(status.metering);

          // If audio level is below threshold, consider it silence
          if (status.metering < -35) {
            startSilenceDetection();
          } else {
            // Reset silence detection if sound is detected
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              setSilenceTimer(null);
              startSilenceDetection();
            }
          }
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          console.warn("Audio recording permissions not granted");
        }
      } catch (error) {
        console.error("Error requesting recording permissions:", error);
      }
    };

    requestPermissions();

    // Set audio mode
    const setupAudioMode = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: false,
          interruptionMode: "doNotMix",
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
          allowsRecording: true,
        });
      } catch (error) {
        console.error("Failed to set audio mode:", error);
      }
    };

    setupAudioMode();

    // Clean up on component unmount
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, []);

  // Function to handle silence detection
  const startSilenceDetection = () => {
    // Clear any existing timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }

    // Set a new timer for 2 seconds
    const timer = setTimeout(() => {
      if (isRecording && autoStopEnabled) {
        console.log("Silence detected - stopping recording");
        handleStopRecording();
      }
    }, 2000); // Stop after 2 seconds of silence

    setSilenceTimer(timer);
  };

  const handlePressIn = async () => {
    try {
      if (isRecording) {
        // If already recording, stop it (user pressed again while recording)
        console.log("Already recording, stopping...");
        handleStopRecording();
        return;
      }

      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Clear any existing silence timers
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start recording
      try {
        console.log("Starting recorder...");

        // Make sure we have recording permissions first
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          console.error("Recording permission not granted");
          throw new Error("Recording permission not granted");
        }

        // Start the recording - the API method name is 'record'
        recorder.record();
        console.log("Recording started");

        // Notify any listeners
        onStartRecording?.();

        // Start silence detection
        startSilenceDetection();
      } catch (error) {
        console.error("Error starting recording:", error);
        setIsRecording(false);

        // Stop animation
        animation.stopAnimation();
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error in handlePressIn:", error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    // Stop animation
    animation.stopAnimation();
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      // Stop recording
      console.log("Stopping recorder...");
      await recorder.stop();

      // Get the recording status to get the file URL
      const status = recorder.getStatus();
      const recordingUrl = status.url;

      console.log("Recording stopped, file available at:", recordingUrl);

      // Read the recorded file as binary using expo-file-system
      let fileData;
      try {
        if (recordingUrl) {
          console.log("Reading file data...");
          fileData = await FileSystem.readAsStringAsync(recordingUrl, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(
            "File data read successfully, length:",
            fileData?.length || 0
          );
        } else {
          console.warn("No file URL from recording");
        }
      } catch (err) {
        console.log("Error reading file:", err);
        // Continue without file data, since we're using mock response anyway
      }

      // Convert to format for proper processing
      // Create a properly typed audio blob for React Native FormData
      const audioBlob = recordingUrl
        ? ({
            uri: recordingUrl,
            name: "audio.m4a",
            type: "audio/m4a",
          } as any)
        : null; // Use type assertion to avoid TypeScript errors

      if (audioBlob) {
        const formData = new FormData();
        formData.append("file", audioBlob);
      }

      try {
        // Just use mock API for now to avoid network issues
        // We're simulating processing the audio without actually sending it
        const response = await mockProcessAudio();

        setTranscription(response);
        console.log("Mock transcription:", response);
        onStopRecording?.(response);
      } catch (error) {
        console.error("Error processing audio:", error);
        onStopRecording?.();
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      onStopRecording?.();
    }
  };

  const buttonSize = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonShadow,
          buttonSize,
          { transform: [{ scale: animation }] },
        ]}
      >
        <TouchableOpacity
          onPress={handlePressIn}
          activeOpacity={0.8}
          disabled={isProcessing}
          style={[
            styles.button,
            buttonSize,
            isRecording && styles.recording,
            isProcessing && styles.processing,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={size / 2}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    zIndex: 999,
  },
  buttonShadow: {
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    backgroundColor: "#30D07B",
    alignItems: "center",
    justifyContent: "center",
  },
  recording: {
    backgroundColor: "#FF6347", // Tomato red when recording
  },
  processing: {
    backgroundColor: "#FFA500", // Orange when processing
  },
  hintText: {
    fontSize: 10,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
});

export default VoiceButton;
