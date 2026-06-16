import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LightTheme as T, Typography, Sizes, Shadows } from '@/constants/design-system';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log('[ErrorBoundary] Error capturado:', error.message);
    console.log('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Algo salió mal</Text>
            <Text style={styles.message}>
              Ha ocurrido un error inesperado en la aplicación.
            </Text>
            <Text style={styles.detail} numberOfLines={3}>
              {this.state.error?.message ?? 'Error desconocido'}
            </Text>
            <Pressable
              style={styles.button}
              onPress={this.handleRetry}
            >
              <Text style={styles.buttonText}>Reintentar</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.paddingXl,
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusXl,
    padding: Sizes.paddingXl,
    alignItems: 'center',
    gap: 16,
    maxWidth: 360,
    width: '100%',
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...Typography.h3,
    color: T.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: T.textSecondary,
    textAlign: 'center',
  },
  detail: {
    fontSize: 12,
    color: T.textTertiary,
    textAlign: 'center',
    backgroundColor: T.inputBg,
    borderRadius: Sizes.radiusSm,
    padding: 10,
    overflow: 'hidden',
    width: '100%',
  },
  button: {
    backgroundColor: T.primary,
    borderRadius: Sizes.radiusMd,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
