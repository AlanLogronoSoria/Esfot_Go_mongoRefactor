import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ErrorBoundary } from '@/core/components/error-boundary';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { NotificationService, type NotificationScreen } from '@/core/notifications/notification.service';

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    NotificationService.requestPermissions().then((granted) => {
      if (granted) {
        NotificationService.getExpoPushToken().then((token) => {
          if (token) console.log('[Notifications] Expo push token:', token);
        });
      }
    });

    const handleTap = (screen: NotificationScreen) => {
      switch (screen.type) {
        case 'event':
          router.push('/(drawer)/(tabs)/events' as any);
          break;
        case 'chat':
          router.push('/(drawer)/chat' as any);
          break;
        case 'tutoria':
          router.push('/(drawer)/tutorias' as any);
          break;
        case 'polibus':
          router.push('/(drawer)/(tabs)/polibus' as any);
          break;
        default:
          break;
      }
    };

    cleanupRef.current = NotificationService.setupHandlers(handleTap);
    return () => cleanupRef.current?.();
  }, [router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <NotificationsProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ title: 'Crear cuenta' }} />
              <Stack.Screen name="auth/recover" options={{ title: 'Recuperar contraseña' }} />
              <Stack.Screen name="auth/verify" options={{ headerShown: false }} />
              <Stack.Screen name="auth/reset-password" options={{ title: 'Nueva contraseña' }} />
              <Stack.Screen name="auth/express-login" options={{ title: 'Acceso Institucional' }} />
              <Stack.Screen name="auth/dev-login" options={{ headerShown: false }} />
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
            <Toast />
          </NotificationsProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
