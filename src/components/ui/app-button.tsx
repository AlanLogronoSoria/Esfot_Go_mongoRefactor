import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, type PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';

interface AppButtonProps extends PressableProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  disabled,
  style,
  onPress: onPressProp,
  ...props
}: AppButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';

  const getTextColor = () => {
    if (disabled && !isOutlineOrGhost) return T.textMuted;
    if (disabled && isOutlineOrGhost) return T.textTertiary;
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'danger') return T.error;
    if (variant === 'ghost') return T.primary;
    return T.textPrimary;
  };

  return (
    <AnimatedPressable
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
        animStyle,
      ]}
      disabled={disabled || isLoading}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 300 });
      }}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressProp?.(e);
      }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          {label ? (
            <Text
              style={[
                styles.textBase,
                styles[`textSize_${size}`],
                { color: getTextColor(), marginLeft: icon ? 6 : 0 },
              ]}
            >
              {label}
            </Text>
          ) : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Sizes.radiusMd,
  },
  disabled: { opacity: 0.5 },
  variant_primary: {
    backgroundColor: T.primary,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  variant_secondary: {
    backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: T.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: T.errorBg,
    borderWidth: 1, borderColor: T.error + '25',
  },
  size_sm: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: Sizes.radiusSm,
  },
  size_md: {
    paddingVertical: 12, paddingHorizontal: 20,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: 16, paddingHorizontal: 24,
    minHeight: Sizes.btnHeight,
  },
  textBase: { ...Typography.button },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
