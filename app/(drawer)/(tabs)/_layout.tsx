import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Map, Bus, CalendarDays, User } from 'lucide-react-native';
import { LightTheme as T } from '@/constants/design-system';

const SPRING_CONFIG = { damping: 18, stiffness: 220, mass: 0.7 };

const TABS = [
  { name: 'index',   label: 'Inicio',   Icon: House },
  { name: 'map',     label: 'Mapa',     Icon: Map },
  { name: 'polibus', label: 'Polibus',  Icon: Bus },
  { name: 'events',  label: 'Eventos',  Icon: CalendarDays },
  { name: 'profile', label: 'Perfil',   Icon: User },
] as const;

const CONTENT_HEIGHT = 64;
const ICON_SIZE = 22;

function TabButton({
  focused,
  activeColor,
  inactiveColor,
  Icon,
  label,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  Icon: React.ComponentType<any>;
  label: string;
  onPress?: ((e?: any) => void) | null;
  onLongPress?: ((e?: any) => void) | null;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, SPRING_CONFIG);
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.3, 1]) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(focused ? 1.12 : 1, SPRING_CONFIG) },
      { translateY: withSpring(focused ? -3 : 0, SPRING_CONFIG) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0.45, { duration: 180 }),
    transform: [{ translateY: withSpring(focused ? 1 : 3, SPRING_CONFIG) }],
  }));

  const color = focused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      onLongPress={(e) => onLongPress?.(e)}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
    >
      <Animated.View style={[styles.pill, pillStyle]} />

      <Animated.View style={iconStyle}>
        <Icon size={ICON_SIZE} strokeWidth={2} color={color} />
      </Animated.View>

      <Animated.Text style={[styles.label, { color }, labelStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 20 + insets.bottom,
            left: 16,
            right: 16,
            height: CONTENT_HEIGHT,
            borderTopWidth: 0,
            borderRadius: 34,
            elevation: 0,
            backgroundColor: 'transparent',
            zIndex: 1,
          },
          tabBarBackground: () => (
            <BlurView
              tint="light"
              intensity={60}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarActiveTintColor: T.primary,
          tabBarInactiveTintColor: T.textTertiary,
          tabBarButton: (props) => {
            const { onPress, onLongPress, accessibilityState } = props;
            const focused = accessibilityState?.selected ?? false;
            return (
              <TabButton
                focused={focused}
                activeColor={T.primary}
                inactiveColor={T.textTertiary}
                Icon={tab?.Icon ?? House}
                label={tab?.label ?? ''}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          },
          tabBarLabel: () => null,
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 10,
    paddingBottom: 6,
  },

  pill: {
    position: 'absolute',
    top: 8,
    height: 34,
    width: 44,
    borderRadius: 17,
    backgroundColor: T.primary + '12',
  },

  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
