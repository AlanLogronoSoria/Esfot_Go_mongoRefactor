import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { FileText, FolderOpen } from 'lucide-react-native';
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
          <Pressable key={t}
            style={[styles.segment, target === t && styles.segmentActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTargetChange(t);
            }}>
            <Text style={[styles.segmentText, target === t && styles.segmentTextActive]}>
              {t === 'usuarios' ? 'Usuarios' : 'Ubicaciones (POIs)'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.dropZone, isParsing && styles.dropZoneLoading]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPickFile();
        }}
        disabled={isParsing}>
        {isParsing ? (
          <>
            <ActivityIndicator color={T.primary} size="large" />
            <Text style={styles.dropZoneHint}>Leyendo archivo...</Text>
          </>
        ) : fileName ? (
          <>
            <FileText size={40} strokeWidth={1.2} color={T.primary} />
            <Text style={styles.dropZoneFile} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.dropZoneHint}>Toca para cambiar el archivo</Text>
          </>
        ) : (
          <>
            <FolderOpen size={40} strokeWidth={1.2} color={T.primary} />
            <Text style={styles.dropZoneTitle}>Seleccionar archivo</Text>
            <Text style={styles.dropZoneHint}>CSV o Excel (.xlsx) · desde almacenamiento o nube</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Sizes.gapMd },
  label: { ...Typography.label, color: T.textSecondary },
  segmented: {
    flexDirection: 'row', backgroundColor: T.inputBg,
    borderRadius: Sizes.radiusMd, padding: 4, gap: 4,
  },
  segment: {
    flex: 1, paddingVertical: 11, borderRadius: Sizes.radiusSm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: T.surface, ...Shadows.sm,
  },
  segmentText: {
    ...Typography.bodySm, fontWeight: '600', color: T.textSecondary,
  },
  segmentTextActive: { color: T.primary },
  dropZone: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.primaryLight + '40',
    borderRadius: Sizes.radiusXl, backgroundColor: T.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, paddingHorizontal: 24, gap: Sizes.gapSm,
  },
  dropZoneLoading: { opacity: 0.7 },
  dropZoneTitle: { ...Typography.h4, color: T.primary },
  dropZoneFile: {
    ...Typography.body, fontWeight: '600',
    color: T.primary, maxWidth: '90%',
  },
  dropZoneHint: {
    ...Typography.bodySm, color: T.textSecondary, textAlign: 'center',
  },
});
