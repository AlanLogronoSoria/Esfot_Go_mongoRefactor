import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { RoleGuard } from '@/core/guards/role.guard';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { useBulkUpload } from '@/features/bulk-upload/application/bulk-upload.hooks';
import { FilePicker } from '@/features/bulk-upload/presentation/file-picker';
import { PreviewTable } from '@/features/bulk-upload/presentation/preview-table';
import { UploadReport } from '@/features/bulk-upload/presentation/upload-report';
import { Lock } from 'lucide-react-native';

export default function BulkUploadScreen() {
  const {
    phase, target, fileName, rows, result, errorMessage, validCount, invalidCount,
    setTarget, pickFile, upload, reset,
  } = useBulkUpload();

  return (
    <RoleGuard allowedRoles={['administrador', 'gestor']} fallback={
      <View style={styles.gate}>
        <Lock size={48} strokeWidth={1.5} color={T.textSecondary} />
        <Text style={styles.gateTitle}>Acceso restringido</Text>
        <Text style={styles.gateDesc}>Solo los administradores pueden cargar datos masivos.</Text>
      </View>
    }>
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Carga masiva</Text>
            <Text style={styles.subtitle}>Importa usuarios o ubicaciones desde un archivo CSV o Excel</Text>
          </View>
          {phase === 'error' && errorMessage && (
            <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{errorMessage}</Text></View>
          )}
          {phase === 'uploading' && (
            <View style={styles.uploadingBanner}>
              <ActivityIndicator color={T.primary} />
              <Text style={styles.uploadingText}>Enviando datos al servidor...</Text>
            </View>
          )}
          {(phase === 'idle' || phase === 'parsing' || phase === 'error') && (
            <FilePicker target={target} onTargetChange={setTarget} onPickFile={pickFile} isParsing={phase === 'parsing'} fileName={fileName} />
          )}
          {(phase === 'previewing' || phase === 'uploading') && (
            <PreviewTable rows={rows} validCount={validCount} invalidCount={invalidCount} onConfirm={upload} onCancel={reset} isUploading={phase === 'uploading'} />
          )}
          {phase === 'success' && result && (
            <UploadReport result={result} onReset={reset} />
          )}
        </ScrollView>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.background },
  scroll: { flex: 1 },
  content: { padding: Sizes.paddingLg, gap: Sizes.gapLg, paddingBottom: 48 },
  header: {
    gap: 6, backgroundColor: T.surfaceGlass,
    padding: Sizes.paddingLg, borderRadius: Sizes.radiusXl,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.md,
  },
  title: { ...Typography.h2, color: T.textPrimary },
  subtitle: { ...Typography.body, color: T.textSecondary, marginTop: 2 },
  gate: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: T.background, gap: 16,
  },
  gateTitle: { ...Typography.h3, color: T.textPrimary },
  gateDesc: { ...Typography.body, color: T.textSecondary, textAlign: 'center' },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: Sizes.paddingMd, borderLeftWidth: 3, borderLeftColor: T.error,
  },
  errorBannerText: { ...Typography.bodySm, color: T.error },
  uploadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.primaryMuted, borderRadius: Sizes.radiusSm,
    padding: Sizes.paddingMd, borderWidth: 1, borderColor: T.primary + '20',
  },
  uploadingText: { ...Typography.body, color: T.primary, fontWeight: '600' },
});
