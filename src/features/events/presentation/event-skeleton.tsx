import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - Sizes.paddingMd * 2;

function SBlock({ w, h, st }: { w: number | string; h: number; st?: object }) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.45, { duration: 800 }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: w, height: h, backgroundColor: T.surfaceBorder, borderRadius: 10 },
        st,
        animatedStyle,
      ]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={s.card}>
      <SBlock h={170} w="100%" st={s.img} />
      <View style={s.body}>
        <SBlock h={12} w={70} st={{ borderRadius: 6 }} />
        <SBlock h={20} w="85%" />
        <SBlock h={14} w="55%" />
        <View style={s.row}>
          <SBlock h={14} w={100} />
          <SBlock h={14} w={70} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusXl,
    overflow: 'hidden',
    marginBottom: Sizes.gapLg,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  img: { width: '100%' },
  body: { padding: Sizes.paddingMd, gap: 10 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
