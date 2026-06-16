import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Redirect, useRouter } from 'expo-router';
import {
  User, Mail, Phone, GraduationCap, CalendarDays, Star, Map,
  Settings2, HelpCircle, KeyRound, LogOut, Pencil, X, ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth.store';
import { UserEntity } from '@/features/auth/domain/user.entity';
import { useInfiniteEvents } from '@/features/events/application/event.hooks';
import { useBusRoutes } from '@/features/polibus/application/bus.hooks';
import { useProfile } from '@/features/profile/application/profile.hooks';
import { useFavoriteCount } from '@/features/favoritos/application/favorite.hooks';
import { ProfileForm } from '@/features/profile/presentation/profile-form';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

// ─── Info Row ───
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Stat Card ───
function StatCard({
  value, label, Icon, color,
}: { value: string | number; label: string; Icon: React.ComponentType<any>; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Icon size={18} strokeWidth={2} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Menu Link ───
function MenuLink({
  icon: Icon, label, onPress, danger = false, isLast = false,
}: {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuLink,
        isLast && styles.menuLinkLast,
        pressed && { backgroundColor: T.pressed },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.menuIconWrap, danger && { backgroundColor: T.errorBg }]}>
        <Icon size={18} strokeWidth={1.8} color={danger ? T.error : T.primary} />
      </View>
      <Text style={[styles.menuLinkLabel, danger && styles.menuLinkDanger]}>{label}</Text>
      <ChevronRight size={18} strokeWidth={1.8} color={T.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const secureLogout = useAuthStore((s) => s.secureLogout);
  const { data: events, error: eventsError } = useInfiniteEvents();
  const { data: routes, error: routesError } = useBusRoutes();
  const { updateProfile } = useProfile();

  if (eventsError) console.log('[ProfileScreen] Error cargando eventos:', (eventsError as Error)?.message ?? eventsError);
  if (routesError) console.log('[ProfileScreen] Error cargando rutas:', (routesError as Error)?.message ?? routesError);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const eventosCount = useMemo(() => events?.length ?? 0, [events]);
  const rutasCount = useMemo(() => (routes ?? []).filter((r) => r.isActive).length, [routes]);
  const favoritosCount = useFavoriteCount();

  if (isInitialized && !user) return <Redirect href="/auth/login" />;
  if (!user) return null;

  const ue = new UserEntity(user);

  const roleLabel =
    user.role === 'administrador'
      ? 'Administrador'
      : user.role === 'docente'
      ? 'Docente'
      : 'Estudiante';

  const roleColor =
    user.role === 'administrador'
      ? T.accent
      : user.role === 'docente'
      ? T.highlight
      : T.primary;

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await secureLogout();
      Toast.show({ type: 'success', text1: 'Sesion cerrada', text2: 'Hasta pronto' });
      router.replace('/auth/login');
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cerrar sesion' });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }, [secureLogout, router]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
          <LinearGradient
            colors={[T.primary, T.primaryLight, T.surface]}
            locations={[0, 0.5, 1]}
            style={styles.heroBg}
          />

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" transition={300} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{ue.initials}</Text>
              </View>
            )}
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
          </View>

          {/* Name & role */}
          <Text style={styles.heroName}>{ue.displayName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
          <Text style={styles.heroEmail}>{user.email}</Text>

          {/* Edit button */}
          <Pressable
            style={styles.editBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowEditModal(true);
            }}
          >
            <Pencil size={15} strokeWidth={2} color="#FFFFFF" />
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.statsRow}>
          <StatCard value={eventosCount} label="Eventos" Icon={CalendarDays} color={T.info} />
          <View style={styles.statDivider} />
          <StatCard value={favoritosCount} label="Favoritos" Icon={Star} color={T.highlight} />
          <View style={styles.statDivider} />
          <StatCard value={rutasCount} label="Rutas" Icon={Map} color={T.success} />
        </Animated.View>

        {/* Personal info */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Información personal</Text>
          <InfoRow icon={<User size={18} strokeWidth={1.8} color={T.primary} />} label="Nombre completo" value={ue.displayName} />
          <View style={styles.divider} />
          <InfoRow icon={<Mail size={18} strokeWidth={1.8} color={T.primary} />} label="Correo institucional" value={user.email ?? '—'} />
          <View style={styles.divider} />
          <InfoRow icon={<Phone size={18} strokeWidth={1.8} color={T.primary} />} label="Telefono" value={user.phone ?? 'No registrado'} />
          <View style={styles.divider} />
          <InfoRow icon={<GraduationCap size={18} strokeWidth={1.8} color={T.primary} />} label="Rol" value={roleLabel} />
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Acciones rápidas</Text>
          <MenuLink icon={Star} label="Mis favoritos" onPress={() => router.push('/favorites' as any)} />
          <MenuLink icon={CalendarDays} label="Mis eventos" onPress={() => router.push('/events' as any)} />
          <MenuLink icon={Settings2} label="Configuracion" onPress={() => router.push('/config' as any)} />
          <MenuLink icon={HelpCircle} label="Ayuda" onPress={() => router.push('/help' as any)} isLast />
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <MenuLink icon={KeyRound} label="Cambiar contrasena" onPress={() => router.push('/auth/recover' as any)} />
          <MenuLink
            icon={LogOut}
            label={isLoggingOut ? 'Cerrando...' : 'Cerrar sesion'}
            onPress={() => {
              if (showLogoutConfirm) {
                handleLogout();
              } else {
                setShowLogoutConfirm(true);
              }
            }}
            danger
            isLast
          />

          {showLogoutConfirm && !isLoggingOut && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.confirmBox}>
              <Text style={styles.confirmText}>Seguro de cerrar sesion?</Text>
              <View style={styles.confirmRow}>
                <Pressable
                  style={styles.confirmCancel}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowLogoutConfirm(false);
                  }}
                >
                  <Text style={styles.confirmCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.confirmDelete} onPress={handleLogout}>
                  <Text style={styles.confirmDeleteText}>Cerrar sesion</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <Pressable
              onPress={() => setShowEditModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={18} strokeWidth={2.2} color={T.textSecondary} />
            </Pressable>
          </View>
          <ProfileForm />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingBottom: Sizes.paddingXl,
    marginBottom: Sizes.gapMd,
    overflow: 'hidden',
    backgroundColor: T.surface,
  },
  heroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 180,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrap: {
    marginTop: 72,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: T.surface,
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: T.surface,
    ...Shadows.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: T.primary,
  },
  roleDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: T.surface,
  },
  heroName: {
    ...Typography.h3,
    color: T.textPrimary,
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: Sizes.radiusFull,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  heroEmail: {
    ...Typography.bodySm,
    color: T.textTertiary,
    marginBottom: 16,
  },
  editBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: T.primary,
    borderRadius: Sizes.radiusMd,
    paddingHorizontal: 24, paddingVertical: 12,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  editBtnText: {
    ...Typography.button, color: '#FFFFFF', fontSize: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Sizes.paddingMd,
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    padding: Sizes.paddingMd,
    marginBottom: Sizes.gapMd,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.md,
  },
  statCard: { alignItems: 'center', gap: 5, flex: 1 },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { ...Typography.h4, color: T.textPrimary, fontSize: 20 },
  statLabel: { ...Typography.caption, color: T.textTertiary },
  statDivider: { width: 1, height: 40, backgroundColor: T.divider },

  // Card
  card: {
    marginHorizontal: Sizes.paddingMd,
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    padding: Sizes.paddingMd,
    marginBottom: Sizes.gapMd,
    gap: 0,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.md,
  },
  cardTitle: {
    ...Typography.overline,
    color: T.primary, marginBottom: 12,
  },

  // Info row
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 14,
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: {
    ...Typography.caption, color: T.textTertiary, marginBottom: 2,
  },
  infoValue: {
    ...Typography.body, color: T.textPrimary, fontWeight: '500',
  },
  divider: { height: 1, backgroundColor: T.divider },

  // Menu link
  menuLink: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: T.divider,
    gap: 14, borderRadius: Sizes.radiusSm,
    paddingHorizontal: 4,
  },
  menuLinkLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLinkLabel: {
    ...Typography.body, color: T.textPrimary, flex: 1, fontSize: 15,
  },
  menuLinkDanger: { color: T.error },

  confirmBox: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusLg,
    padding: Sizes.paddingLg, gap: 14,
    borderWidth: 1, borderColor: T.error + '25',
    marginTop: 12, ...Shadows.lg,
  },
  confirmText: {
    ...Typography.body, color: T.textPrimary, fontWeight: '600',
  },
  confirmRow: { flexDirection: 'row', gap: 12 },
  confirmCancel: {
    flex: 1, backgroundColor: T.surfaceBorder,
    borderRadius: Sizes.radiusSm, padding: 13, alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 14, fontWeight: '700', color: T.textSecondary,
  },
  confirmDelete: {
    flex: 1, backgroundColor: T.error,
    borderRadius: Sizes.radiusSm, padding: 13, alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14, fontWeight: '700', color: '#FFFFFF',
  },
  modalContainer: { flex: 1, backgroundColor: T.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Sizes.paddingLg, paddingTop: Sizes.paddingLg,
    paddingBottom: Sizes.paddingMd,
    borderBottomWidth: 1, borderBottomColor: T.divider,
    backgroundColor: T.surface,
  },
  modalTitle: { ...Typography.h3, color: T.textPrimary },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
});
