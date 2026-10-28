import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  prefix?: string;
  suffix?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  required = false,
  prefix,
  suffix,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredMark}> *</Text>}
      </View>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
          textInputProps.editable === false && styles.inputWrapperDisabled,
        ]}
      >
        {prefix ? <Text style={styles.prefixText}>{prefix}</Text> : null}

        <TextInput
          style={[
            styles.input,
            prefix ? styles.inputWithPrefix : undefined,
            suffix ? styles.inputWithSuffix : undefined,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...textInputProps}
        />

        {suffix ? <Text style={styles.suffixText}>{suffix}</Text> : null}
      </View>

      {hasError ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  requiredMark: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.disabledBg,
    borderColor: colors.disabledBorder,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
  },
  inputWithPrefix: {
    paddingLeft: spacing.xs,
  },
  inputWithSuffix: {
    paddingRight: spacing.xs,
  },
  prefixText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  suffixText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorIcon: {
    fontSize: 11,
    marginRight: spacing.xxs + 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default CustomInput;
