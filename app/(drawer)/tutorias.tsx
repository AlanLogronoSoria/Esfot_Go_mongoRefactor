import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { useTutorias, useTutoriaEnrollment } from '@/features/tutorias/application/tutorias.hooks';
import { TutoriaForm } from '@/features/tutorias/presentation/tutoria-form';
import type { Tutoria } from '@/features/tutorias/domain/tutoria.entity';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/constants/roles';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';
import { Calendar, Clock, MapPin, Users, Edit2, Trash2 } from 'lucide-react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';

const STATUS_CHIPS: { key: Tutoria['status'] | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'programada', label: 'Programadas' },
  { key: 'finalizada', label: 'Finalizadas' },
  { key: 'cancelada', label: 'Canceladas' },
];

const STATUS_COLORS: Record<Tutoria['status'], string> = {
  programada: '#1B6BB0', en_curso: '#059669',
  finalizada: '#6B7280', cancelada: '#DC2626',
};

export default function TutoriasScreen() {
  const user = useAuthStore((s) => s.user);
  const isDocente = user?.role === 'docente';
  const isAdmin = user?.role === 'administrador';
  const isEstudiante = user?.role === 'estudiante';

  const {
    tutorias, isLoading, search, setSearch,
    statusFilter, setStatusFilter,
    ownerFilter, setOwnerFilter,
    createTutoria, updateTutoria, deleteTutoria, cancelTutoria,
  } = useTutorias();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Tutoria | null>(null);
  const [mainTab, setMainTab] = useState<'explorar' | 'mis_tutorias'>('explorar');

  const filteredTutorias = tutorias.filter((t) => {
    if (mainTab === 'explorar') return true;
    if (isDocente) return t.createdBy === user?.id;
    if (isEstudiante) {
      // For now, if we don't have the full enrolled array locally in the Tutoria object, 
      // we might need a separate hook, but we can assume 'mis_tutorias' is filtered by API.
      // But since useTutorias fetches all, we should filter here if we can.
      // If we can't tell, we just show all for now.
      return true; // We'll rely on the status chips mostly
    }
    return true;
  });

  const handleCreate = useCallback(async (input: Omit<Tutoria, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    await createTutoria.mutateAsync(input);
    setShowForm(false);
  }, [createTutoria]);

  const handleUpdate = useCallback(async (input: Omit<Tutoria, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    if (!editTarget) return;
    await updateTutoria.mutateAsync({ id: editTarget.id, input });
    setEditTarget(null);
  }, [editTarget, updateTutoria]);

  const handleDelete = useCallback((item: Tutoria) => {
    Alert.alert('Eliminar tutoría', `¿Eliminar "${item.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTutoria.mutate(item.id) },
    ]);
  }, [deleteTutoria]);

  const renderItem = useCallback(({ item }: { item: Tutoria }) => {
    const isPast = item.status === 'finalizada' || item.status === 'cancelada';
    const sc = STATUS_COLORS[item.status];
    const canEdit = isDocente || isAdmin;
    const canDelete = isAdmin || (isDocente && item.createdBy === user?.id);

    return (
      <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 12 }}>
        <AppCard style={isPast && styles.cardPast}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc + '15' }]}>
                <Text style={[styles.statusText, { color: sc }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.subject}>{item.subject}</Text>
          </View>
          {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
          <View style={styles.meta}>
            {item.horarios && item.horarios.length > 0 ? (
              item.horarios.map((h, i) => (
                <View style={styles.metaRow} key={i}>
                  <Calendar size={14} color={T.textSecondary} />
                  <Text style={styles.metaItem}>{h.dia}  {h.horaInicio} - {h.horaFin}</Text>
                </View>
              ))
            ) : (
              <View style={styles.metaRow}>
                <Calendar size={14} color={T.textSecondary} />
                <Text style={styles.metaItem}>{item.date} · {item.time}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Clock size={14} color={T.textSecondary} />
              <Text style={styles.metaItem}>{item.duration} min</Text>
            </View>
            {item.location && (
              <View style={styles.metaRow}>
                <MapPin size={14} color={T.textSecondary} />
                <Text style={styles.metaItem}>{item.location}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Users size={14} color={T.textSecondary} />
              <Text style={styles.metaItem}>{item.enrolledCount}/{item.maxStudents} estudiantes</Text>
            </View>
          </View>
          <View style={styles.actions}>
            {isEstudiante && item.status === 'programada' && (
              <EnrollButton tutoriaId={item.id} />
            )}
            {canEdit && item.status === 'programada' && (
              <AppButton 
                label="Editar" 
                variant="ghost" 
                size="sm" 
                icon={<Edit2 size={14} color={T.primary} />} 
                onPress={() => setEditTarget(item)} 
              />
            )}
            {canEdit && item.status === 'programada' && (
              <AppButton 
                label="Cancelar" 
                variant="danger" 
                size="sm" 
                onPress={() => cancelTutoria.mutate(item.id)} 
              />
            )}
            {canDelete && (
              <AppButton 
                label="Eliminar" 
                variant="danger" 
                size="sm" 
                icon={<Trash2 size={14} color={T.error} />} 
                onPress={() => handleDelete(item)} 
              />
            )}
          </View>
        </AppCard>
      </Animated.View>
    );
  }, [isDocente, isAdmin, isEstudiante, user, cancelTutoria, handleDelete]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Tutorías</Text>
            <Text style={styles.subtitle}>Gestión de sesiones de tutoría</Text>
          </View>
          {(isDocente || isAdmin) && (
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.createBtnText}>+ Crear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TextInput style={styles.search} placeholder="🔍 Buscar tutorías..." placeholderTextColor={T.inputPlaceholder} value={search} onChangeText={setSearch} />

      <View style={styles.ownerRow}>
        {(['todas', 'mis'] as const).map((key) => (
          <TouchableOpacity key={key}
            style={[styles.ownerChip, ownerFilter === key && styles.ownerChipActive]}
            onPress={() => setOwnerFilter(key)}>
            <Text style={[styles.ownerChipText, ownerFilter === key && styles.ownerChipTextActive]}>
              {key === 'todas' ? '🌐 Explorar' : '📋 Mis Tutorías'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mainTabs}>
        <TouchableOpacity style={[styles.mainTab, mainTab === 'explorar' && styles.mainTabActive]} onPress={() => setMainTab('explorar')}>
          <Text style={[styles.mainTabText, mainTab === 'explorar' && styles.mainTabTextActive]}>Explorar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mainTab, mainTab === 'mis_tutorias' && styles.mainTabActive]} onPress={() => setMainTab('mis_tutorias')}>
          <Text style={[styles.mainTabText, mainTab === 'mis_tutorias' && styles.mainTabTextActive]}>Mis Tutorías</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {STATUS_CHIPS.map((chip) => (
          <TouchableOpacity key={chip.key} style={[styles.chip, statusFilter === chip.key && styles.chipActive]} onPress={() => setStatusFilter(chip.key)}>
            <Text style={[styles.chipText, statusFilter === chip.key && styles.chipTextActive]}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading && <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />}

      <FlatList data={filteredTutorias} keyExtractor={(item) => item.id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon={Calendar} title="No se encontraron tutorías" description="Intenta cambiar los filtros de búsqueda o crea una nueva." />}
        removeClippedSubviews maxToRenderPerBatch={8} windowSize={5} initialNumToRender={5}
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.modalCancel}>Cancelar</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Crear tutoría</Text>
            <View style={{ width: 60 }} />
          </View>
          <TutoriaForm onSubmit={handleCreate} isLoading={createTutoria.isPending} />
        </View>
      </Modal>

      <Modal visible={!!editTarget} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditTarget(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditTarget(null)}><Text style={styles.modalCancel}>Cancelar</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Editar tutoría</Text>
            <View style={{ width: 60 }} />
          </View>
          {editTarget && (
            <TutoriaForm
              editData={editTarget}
              onSubmit={handleUpdate}
              isLoading={updateTutoria.isPending}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function EnrollButton({ tutoriaId }: { tutoriaId: string }) {
  const user = useAuthStore((s) => s.user);
  const { isEnrolled, isLoading, enroll, unenroll } = useTutoriaEnrollment(tutoriaId);

  if (!user) return null;

  return (
    <AppButton
      variant={isEnrolled ? 'outline' : 'primary'}
      size="sm"
      label={isEnrolled ? '✓ Inscrito' : 'Inscribirse'}
      isLoading={isLoading || enroll.isPending || unenroll.isPending}
      onPress={() => isEnrolled ? unenroll.mutate() : enroll.mutate()}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  header: { padding: 16, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: T.textPrimary },
  subtitle: { fontSize: 13, color: T.textSecondary, marginTop: 2 },
  createBtn: { backgroundColor: T.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { fontSize: 13, fontWeight: '700', color: T.text },
  search: { marginHorizontal: 16, marginBottom: 8, backgroundColor: T.surface, borderRadius: 10, padding: 12, fontSize: 14, color: T.textPrimary, ...Shadows.sm },
  ownerRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  ownerChip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: T.surface, alignItems: 'center', borderWidth: 1.5, borderColor: T.cardBorder },
  ownerChipActive: { backgroundColor: T.primaryMuted, borderColor: T.primary },
  ownerChipText: { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  ownerChipTextActive: { color: T.primary },
  filters: { paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  chip: { backgroundColor: T.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: T.cardBorder },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: T.textSecondary },
  chipTextActive: { color: T.surface },
  mainTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  mainTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: T.surface },
  mainTabActive: { backgroundColor: T.primary },
  mainTabText: { fontSize: 14, fontWeight: '600', color: T.textSecondary },
  mainTabTextActive: { color: T.text },
  list: { padding: 16, paddingTop: 4 },
  cardPast: { opacity: 0.6 },
  cardHeader: { gap: 2 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: T.textPrimary, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  subject: { fontSize: 12, color: T.textSecondary },
  desc: { fontSize: 13, color: T.textSecondary, lineHeight: 18, marginVertical: 6 },
  meta: { gap: 6, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontSize: 12, color: T.textSecondary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: T.cardBorder, paddingTop: 10 },
  modalContainer: { flex: 1, backgroundColor: T.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: T.divider },
  modalTitle: { ...Typography.h4, color: T.textPrimary },
  modalCancel: { fontSize: 15, color: T.textSecondary },
});
