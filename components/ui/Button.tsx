import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<Props> = ({
  title,
  onPress,
  style,
  disabled,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      style={[
        s.base,
        s[`variant_${variant}`],
        s[`size_${size}`],
        disabled && s.disabled,
        style,
        animStyle,
      ]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : T.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              s.text,
              s[`textVariant_${variant}`],
              s[`textSize_${size}`],
              icon ? s.textWithIcon : null,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const s = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.radiusMd,
  },

  variant_primary: {
    backgroundColor: T.primary,
    ...Shadows.md,
    shadowColor: T.primary,
    shadowOpacity: 0.3,
  },
  variant_secondary: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: T.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: T.error,
    ...Shadows.md,
    shadowColor: T.error,
    shadowOpacity: 0.3,
  },

  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Sizes.radiusSm,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: Sizes.btnHeight,
  },

  disabled: {
    opacity: 0.45,
  },

  text: {
    ...Typography.button,
  },
  textVariant_primary: { color: '#FFFFFF' },
  textVariant_secondary: { color: T.textPrimary },
  textVariant_outline: { color: T.primary },
  textVariant_ghost: { color: T.primary },
  textVariant_danger: { color: '#FFFFFF' },

  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },

  textWithIcon: { marginLeft: 8 },
});

export default Button;
