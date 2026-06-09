import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { RoleGuard } from '@/core/guards/role.guard';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import { useBulkUpload } from '@/features/bulk-upload/application/bulk-upload.hooks';
import { FilePicker } from '@/features/bulk-upload/presentation/file-picker';
import { PreviewTable } from '@/features/bulk-upload/presentation/preview-table';
import { UploadReport } from '@/features/bulk-upload/presentation/upload-report';

export default function BulkUploadScreen() {
  const {
    phase, target, fileName, rows, result, errorMessage, validCount, invalidCount,
    setTarget, pickFile, upload, reset,
  } = useBulkUpload();

  return (
    <RoleGuard allowedRoles={['administrador', 'gestor']} fallback={
      <View style={styles.gate}>
        <Text style={styles.gateIcon}>🔒</Text>
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
            <View style={styles.errorBanner}><Text style={styles.errorBannerText}>⚠ {errorMessage}</Text></View>
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
  header: { gap: Sizes.gapXs },
  title: { ...Typography.h2, color: T.textPrimary },
  subtitle: { ...Typography.body, color: T.textSecondary },
  gate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: T.background, gap: 12 },
  gateIcon: { fontSize: 48 },
  gateTitle: { ...Typography.h3, color: T.textPrimary },
  gateDesc: { ...Typography.body, color: T.textSecondary, textAlign: 'center' },
  errorBanner: { backgroundColor: T.errorBg, borderRadius: Sizes.radiusMd, padding: Sizes.paddingMd, borderLeftWidth: 3, borderLeftColor: T.error },
  errorBannerText: { ...Typography.bodySm, color: T.error, fontWeight: '600' },
  uploadingBanner: { flexDirection: 'row', alignItems: 'center', gap: Sizes.gapMd, backgroundColor: T.infoBg, borderRadius: Sizes.radiusMd, padding: Sizes.paddingMd },
  uploadingText: { ...Typography.body, color: T.info, fontWeight: '600' },
});
