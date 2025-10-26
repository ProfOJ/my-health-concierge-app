import colors from "@/constants/colors";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholderTextColor={colors.text.light}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.background.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 6,
  },
});
