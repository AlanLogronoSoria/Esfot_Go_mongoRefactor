import React, { useState, useCallback } from 'react';
import {
  TextInput as RNInput, StyleSheet, Text, TextInputProps, View,
} from 'react-native';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const TextInput: React.FC<Props> = ({ label, error, icon, rightElement, style, onFocus, onBlur, ...rest }) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View style={s.container}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.wrap, focused && s.wrapFocused, error ? s.wrapError : null]}>
        {icon ? (
          typeof icon === 'string' ? (
            <Text style={s.iconText}>{icon}</Text>
          ) : (
            <View style={s.iconWrap}>{icon}</View>
          )
        ) : null}
        <RNInput
          style={[s.input, icon ? s.inputWithIcon : null, rightElement ? s.inputWithRight : null]}
          placeholderTextColor={T.inputPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightElement}
      </View>
      {error ? (
        <View style={s.errorRow}>
          <Text style={s.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 14, gap: 6 },
  label: { ...Typography.label, color: T.textSecondary },
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.inputBg,
    borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusMd,
  },
  wrapFocused: {
    borderColor: T.inputBorderFocus,
    backgroundColor: T.surface,
    ...Shadows.xs,
  },
  wrapError: { borderColor: T.error },
  iconText: { fontSize: 18, paddingLeft: 14 },
  iconWrap: { width: 20, alignItems: 'center', marginLeft: 14 },
  input: {
    flex: 1,
    paddingVertical: 14, paddingHorizontal: 14,
    fontSize: 15, color: T.inputText,
  },
  inputWithIcon: { paddingLeft: 8 },
  inputWithRight: { paddingRight: 8 },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', paddingLeft: 4,
  },
  error: { ...Typography.caption, color: T.error },
});

export default TextInput;
