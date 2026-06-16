import { View, StyleSheet } from 'react-native';
import { EmailVerificationScreen } from '@/features/auth/presentation/email-verification';
import { LightTheme as T, Shadows } from '@/constants/design-system';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerifyScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[T.primary, T.primaryLight, T.background]} locations={[0, 0.2, 1]} style={styles.gradient} />
      <View style={styles.container}>
        <EmailVerificationScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  gradient: { position: 'absolute', top: -60, left: 0, right: 0, height: 320 },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
});
