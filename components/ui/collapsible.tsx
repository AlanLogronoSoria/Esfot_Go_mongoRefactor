import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { LightTheme as T, Typography, Sizes } from '@/constants/design-system';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
      >
        <ChevronRight
          size={18}
          strokeWidth={2}
          color={T.textSecondary}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Animated.Text style={styles.title}>{title}</Animated.Text>
      </Pressable>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: T.textPrimary,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
