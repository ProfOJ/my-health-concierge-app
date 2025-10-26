import colors from "@/constants/colors";
import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.text.inverse : colors.primary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryText : styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  fullWidth: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.primary,
  },
});
