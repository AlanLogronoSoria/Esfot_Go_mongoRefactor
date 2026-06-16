import { StyleSheet, Text, type TextProps } from 'react-native';
import { LightTheme as T, Typography } from '@/constants/design-system';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: T.textPrimary },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...Typography.body,
  },
  defaultSemiBold: {
    ...Typography.body,
    fontWeight: '600',
  },
  title: {
    ...Typography.h1,
  },
  subtitle: {
    ...Typography.h3,
  },
  link: {
    ...Typography.body,
    color: T.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
