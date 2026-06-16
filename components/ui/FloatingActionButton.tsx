import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import { LightTheme as T, Shadows } from '@/constants/design-system';

interface FloatingActionButtonProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({
  onPress,
  bottom = 90,
  right = 20,
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const onPressIn = () => {
    scale.value = withSpring(0.88, { damping: 16, stiffness: 320 });
    rotation.value = withTiming(90, { duration: 200 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    rotation.value = withTiming(0, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <AnimatedPressable
      style={[styles.fab, { bottom, right }, animatedStyle]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Plus size={28} strokeWidth={2} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    ...Shadows.xl,
  },
});
