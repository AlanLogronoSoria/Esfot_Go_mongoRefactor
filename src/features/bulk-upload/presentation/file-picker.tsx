import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import type { BulkUploadTarget } from '../domain/bulk-upload.entity';

interface FilePickerProps {
  target: BulkUploadTarget;
  onTargetChange: (t: BulkUploadTarget) => void;
  onPickFile: () => void;
  isParsing: boolean;
  fileName: string | null;
}

export function FilePicker({ target, onTargetChange, onPickFile, isParsing, fileName }: FilePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de datos</Text>
      <View style={styles.segmented}>
        {(['usuarios', 'pois'] as BulkUploadTarget[]).map((t) => (
          <TouchableOpacity key={t}
            style={[styles.segment, target === t && styles.segmentActive]}
            onPress={() => onTargetChange(t)} activeOpacity={0.7}>
            <Text style={[styles.segmentText, target === t && styles.segmentTextActive]}>
              {t === 'usuarios' ? '👤  Usuarios' : '📍  Ubicaciones (POIs)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.dropZone, isParsing && styles.dropZoneLoading]}
        onPress={onPickFile} activeOpacity={0.75} disabled={isParsing}>
        {isParsing ? (
          <>
            <ActivityIndicator color={T.primary} size="large" />
            <Text style={styles.dropZoneHint}>Leyendo archivo…</Text>
          </>
        ) : fileName ? (
          <>
            <Text style={styles.dropZoneIcon}>📄</Text>
            <Text style={styles.dropZoneFile} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.dropZoneHint}>Toca para cambiar el archivo</Text>
          </>
        ) : (
          <>
            <Text style={styles.dropZoneIcon}>📂</Text>
            <Text style={styles.dropZoneTitle}>Seleccionar archivo</Text>
            <Text style={styles.dropZoneHint}>CSV o Excel (.xlsx) · desde almacenamiento o nube</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Sizes.gapMd },
  label: { ...Typography.label, color: T.textSecondary },
  segmented: { flexDirection: 'row', backgroundColor: T.inputBg, borderRadius: Sizes.radiusMd, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: Sizes.radiusSm, alignItems: 'center' },
  segmentActive: { backgroundColor: T.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  segmentText: { ...Typography.bodySm, fontWeight: '600', color: T.textSecondary },
  segmentTextActive: { color: T.primary },
  dropZone: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.primaryMuted, borderRadius: Sizes.radiusLg, backgroundColor: T.infoBg, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: Sizes.gapSm },
  dropZoneLoading: { opacity: 0.7 },
  dropZoneIcon: { fontSize: 40 },
  dropZoneTitle: { ...Typography.h4, color: T.primary },
  dropZoneFile: { ...Typography.body, fontWeight: '600', color: T.primary, maxWidth: '90%' },
  dropZoneHint: { ...Typography.bodySm, color: T.textSecondary, textAlign: 'center' },
});
