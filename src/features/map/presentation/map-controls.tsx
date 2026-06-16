import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plus, Minus, MapPin } from 'lucide-react-native';
import { LightTheme as T, Shadows, Sizes } from '@/constants/design-system';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  onToggleTraffic?: () => void;
  trafficEnabled?: boolean;
  isLocating?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CtrlBtn({
  onPress,
  icon,
  active,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  active?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[s.btn, active && s.btnActive, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.85, { damping: 16, stiffness: 400 }); }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {icon}
    </AnimatedPressable>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onMyLocation,
  isLocating,
}: MapControlsProps) {
  return (
    <View style={s.container}>
      <CtrlBtn onPress={onZoomIn} icon={<Plus size={22} strokeWidth={2} color={T.primary} />} />
      <View style={s.divider} />
      <CtrlBtn onPress={onZoomOut} icon={<Minus size={22} strokeWidth={2} color={T.primary} />} />
      <View style={s.divider} />
      <CtrlBtn
        onPress={onMyLocation}
        active={isLocating}
        icon={<MapPin size={18} strokeWidth={2} color={isLocating ? T.primary : T.textSecondary} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    padding: 4, gap: 2,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.lg,
  },
  btn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: T.surface,
  },
  btnActive: {
    backgroundColor: T.primaryMuted,
  },
  divider: {
    height: 1, backgroundColor: T.divider, marginHorizontal: 10,
  },
});
