import React, { memo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BusStop } from '@/features/polibus/domain/route.entity';
import { LightTheme as T, Shadows, Sizes } from '@/constants/design-system';

interface StopListProps {
  stops: BusStop[];
  onStopPress?: (stop: BusStop, index: number) => void;
  routeColor: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StopCard({
  stop,
  idx,
  total,
  routeColor,
  onPress,
}: {
  stop: BusStop;
  idx: number;
  total: number;
  routeColor: string;
  onPress: () => void;
}) {
  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const circleColor = isFirst ? T.success : isLast ? T.error : routeColor;

  return (
    <AnimatedPressable
      style={[styles.card, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.numberCircle, { backgroundColor: circleColor }]}>
        <Text style={styles.numberText}>{idx + 1}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>{stop.name}</Text>
      {isFirst && (
        <View style={styles.labelStart}>
          <Text style={styles.labelText}>Inicio</Text>
        </View>
      )}
      {isLast && (
        <View style={styles.labelEnd}>
          <Text style={styles.labelTextEnd}>Fin</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export const StopList = memo(function StopList({
  stops,
  onStopPress,
  routeColor,
}: StopListProps) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paradas oficiales</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {stops.map((stop, idx) => (
          <StopCard
            key={stop.id}
            stop={stop}
            idx={idx}
            total={stops.length}
            routeColor={routeColor}
            onPress={() => onStopPress?.(stop, idx)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 10 },
  title: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  scroll: { gap: 10, paddingRight: 8 },
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 12,
    width: 120,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.xs,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: T.textPrimary,
    textAlign: 'center',
  },
  labelStart: {
    backgroundColor: T.successBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelText: {
    fontSize: 9, fontWeight: '700', color: T.success,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  labelEnd: {
    backgroundColor: T.errorBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelTextEnd: {
    fontSize: 9, fontWeight: '700', color: T.error,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
});
