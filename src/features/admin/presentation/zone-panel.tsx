import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FlashList } from '@shopify/flash-list';
import type { RestrictedZone, ZoneRestrictionType } from '@/features/admin/domain/poi.entity';
import { useAdminZones } from '@/features/admin/application/poi.hooks';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { Edit2, Trash2 } from 'lucide-react-native';

const RESTRICTION_TYPE_OPTIONS: { value: ZoneRestrictionType; label: string; color: string }[] = [
  { value: 'acceso_restringido', label: 'Acceso restringido', color: '#DC2626' },
  { value: 'construccion', label: 'Construcción', color: '#F59E0B' },
  { value: 'peatonal', label: 'Peatonal', color: '#3B82F6' },
  { value: 'emergencia', label: 'Emergencia', color: '#EF4444' },
  { value: 'ambiental', label: 'Ambiental', color: '#10B981' },
  { value: 'seguridad', label: 'Seguridad', color: '#8B5CF6' },
  { value: 'otro', label: 'Otro', color: '#6B7280' },
];

interface ZonePanelProps {
  zones: RestrictedZone[];
  zLoading: boolean;
  createZone: ReturnType<typeof useAdminZones>['createZone'];
  updateZone: ReturnType<typeof useAdminZones>['updateZone'];
  deleteZone: ReturnType<typeof useAdminZones>['deleteZone'];
}

export function ZonePanel({ zones, zLoading, createZone, updateZone, deleteZone }: ZonePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<RestrictedZone | null>(null);
  const [zName, setZName] = useState('');
  const [zDesc, setZDesc] = useState('');
  const [zCoords, setZCoords] = useState('');
  const [zFill, setZFill] = useState('rgba(200,16,46,0.2)');
  const [zStroke, setZStroke] = useState('#C8102E');
  const [zType, setZType] = useState<ZoneRestrictionType>('acceso_restringido');
  const [zSchedule, setZSchedule] = useState('');

  const resetForm = () => {
    setShowForm(false); setEditTarget(null);
    setZName(''); setZDesc(''); setZCoords('');
    setZFill('rgba(200,16,46,0.2)'); setZStroke('#C8102E');
    setZType('acceso_restringido'); setZSchedule('');
  };

  const handleSubmit = () => {
    if (!zName.trim() || !zCoords.trim()) return;

    let coords: { latitude: number; longitude: number }[];
    try {
      coords = JSON.parse(zCoords);
      if (!Array.isArray(coords) || coords.length < 3) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Se necesitan al menos 3 puntos para un polígono' });
        return;
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Coordenadas JSON inválidas' });
      return;
    }

    for (const c of coords) {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Cada punto debe tener latitude y longitude numéricos' });
        return;
      }
      if (c.latitude < -90 || c.latitude > 90 || c.longitude < -180 || c.longitude > 180) {
        Toast.show({ type: 'error', text1: 'Error', text2: `Coordenada fuera de rango: (${c.latitude}, ${c.longitude})` });
        return;
      }
    }

    const input = {
      name: zName.trim(),
      description: zDesc || undefined,
      coordinates: coords,
      fillColor: zFill,
      strokeColor: zStroke,
      isActive: true,
      restrictionType: zType,
      activeSchedule: zSchedule.trim() || null,
    };

    if (editTarget) {
      updateZone.mutate({ id: editTarget.id, input }, { onSuccess: resetForm });
    } else {
      createZone.mutate(input, { onSuccess: resetForm });
    }
  };

  const startEdit = (z: RestrictedZone) => {
    setEditTarget(z); setShowForm(true);
    setZName(z.name); setZDesc(z.description ?? '');
    setZCoords(JSON.stringify(z.coordinates));
    setZFill(z.fillColor); setZStroke(z.strokeColor);
    setZType(z.restrictionType);
    setZSchedule(z.activeSchedule ?? '');
  };

  return (
    <View style={zoneStyles.container}>
      <View style={zoneStyles.header}>
        <Text style={zoneStyles.title}>Zonas Restringidas ({zones.length})</Text>
        <TouchableOpacity style={zoneStyles.addBtn} onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={zoneStyles.addBtnText}>+ Zona</Text>
        </TouchableOpacity>
      </View>

      {zLoading && <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />}

      <FlashList
        data={zones}
        keyExtractor={(z) => z.id}
        renderItem={({ item: zone }) => (
          <View style={[zoneStyles.card, !zone.isActive && { opacity: 0.5 }]}>
            <View style={zoneStyles.cardHeader}>
              <View style={[zoneStyles.colorDot, { backgroundColor: zone.fillColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={zoneStyles.cardName}>{zone.name}</Text>
                {zone.description ? <Text style={zoneStyles.cardDesc}>{zone.description}</Text> : null}
                <View style={zoneStyles.cardMetaRow}>
                  <Text style={zoneStyles.cardMeta}>{zone.coordinates.length} puntos</Text>
                  <View style={[zoneStyles.typeBadge, { backgroundColor: RESTRICTION_TYPE_OPTIONS.find((o) => o.value === zone.restrictionType)?.color + '18' }]}>
                    <Text style={[zoneStyles.typeBadgeText, { color: RESTRICTION_TYPE_OPTIONS.find((o) => o.value === zone.restrictionType)?.color }]}>
                      {RESTRICTION_TYPE_OPTIONS.find((o) => o.value === zone.restrictionType)?.label ?? zone.restrictionType}
                    </Text>
                  </View>
                  {zone.activeSchedule && <Text style={zoneStyles.cardMeta}>{zone.activeSchedule}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => startEdit(zone)}><Edit2 size={18} color={T.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Eliminar zona', `¿Eliminar "${zone.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteZone.mutate(zone.id) }])}>
                <Trash2 size={18} color={T.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {zones.length === 0 && !zLoading && <Text style={zoneStyles.empty}>No hay zonas configuradas</Text>}

      {showForm && (
        <View style={zoneStyles.formCard}>
          <Text style={zoneStyles.formTitle}>{editTarget ? 'Editar zona' : 'Nueva zona'}</Text>
          <TextInput style={zoneStyles.input} placeholder="Nombre" placeholderTextColor={T.inputPlaceholder} value={zName} onChangeText={setZName} />
          <TextInput style={zoneStyles.input} placeholder="Descripción" placeholderTextColor={T.inputPlaceholder} value={zDesc} onChangeText={setZDesc} />
          <TextInput style={[zoneStyles.input, zoneStyles.textarea]} placeholder='Coordenadas JSON: [{"latitude":-0.21,"longitude":-78.49}]' placeholderTextColor={T.inputPlaceholder} value={zCoords} onChangeText={setZCoords} multiline numberOfLines={3} textAlignVertical="top" />
          <View style={zoneStyles.row}>
            <TextInput style={[zoneStyles.input, zoneStyles.half]} placeholder="Fill color" placeholderTextColor={T.inputPlaceholder} value={zFill} onChangeText={setZFill} />
            <TextInput style={[zoneStyles.input, zoneStyles.half]} placeholder="Stroke color" placeholderTextColor={T.inputPlaceholder} value={zStroke} onChangeText={setZStroke} />
          </View>
          <Text style={zoneStyles.sectionLabel}>Tipo de restricción</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={zoneStyles.typeChips}>
            {RESTRICTION_TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[zoneStyles.typeChip, zType === opt.value && { backgroundColor: opt.color, borderColor: opt.color }]}
                onPress={() => setZType(opt.value)}
              >
                <Text style={[zoneStyles.typeChipText, zType === opt.value && { color: '#FFFFFF' }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={zoneStyles.input} placeholder="Horario activo (ej: Lun-Vie 08:00-18:00)" placeholderTextColor={T.inputPlaceholder} value={zSchedule} onChangeText={setZSchedule} />
          <View style={zoneStyles.formActions}>
            <TouchableOpacity style={zoneStyles.saveBtn} onPress={handleSubmit} disabled={createZone.isPending || updateZone.isPending}>
              {createZone.isPending || updateZone.isPending ? <ActivityIndicator color={T.text} size="small" /> : <Text style={zoneStyles.saveBtnText}>{editTarget ? 'Actualizar' : 'Crear'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={zoneStyles.cancelBtn} onPress={resetForm}><Text style={zoneStyles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const zoneStyles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: T.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.h3, color: T.textPrimary },
  addBtn: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    paddingHorizontal: 16, paddingVertical: 10,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  addBtnText: { ...Typography.caption, fontWeight: '700', color: '#FFFFFF' },
  card: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusLg,
    padding: 16, marginBottom: 10, ...Shadows.md, borderWidth: 1, borderColor: T.cardBorder,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#FFFFFF', ...Shadows.xs,
  },
  cardName: { ...Typography.body, color: T.textPrimary, fontWeight: '700' },
  cardDesc: { ...Typography.caption, color: T.textSecondary, marginTop: 2 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  cardMeta: { ...Typography.caption, color: T.textTertiary },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  empty: {
    textAlign: 'center', color: T.textSecondary,
    marginTop: 20, ...Typography.body,
  },
  formCard: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusLg,
    padding: 16, gap: 10, borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.md,
  },
  formTitle: { ...Typography.h4, color: T.textPrimary, marginBottom: 2 },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 12,
    fontSize: 14, color: T.inputText,
  },
  textarea: { minHeight: 80 },
  sectionLabel: { ...Typography.overline, color: T.textSecondary, marginTop: 2 },
  typeChips: { gap: 6 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Sizes.radiusFull,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.cardBorder,
  },
  typeChipText: { fontSize: 12, fontWeight: '600', color: T.textSecondary },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: {
    flex: 1, backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 14, alignItems: 'center', ...Shadows.sm,
  },
  saveBtnText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
  cancelBtn: {
    flex: 1, backgroundColor: T.surface, borderRadius: Sizes.radiusSm,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder,
  },
  cancelBtnText: { ...Typography.body, color: T.textSecondary, fontWeight: '600' },
});
