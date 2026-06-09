import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import type { UploadResult } from '../domain/bulk-upload.entity';

interface UploadReportProps {
  result: UploadResult;
  onReset: () => void;
}

export function UploadReport({ result, onReset }: UploadReportProps) {
  const [showErrors, setShowErrors] = useState(false);
  const allOk = result.failed === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, allOk ? styles.iconCircleSuccess : styles.iconCircleWarn]}>
        <Text style={styles.icon}>{allOk ? '✓' : '⚠'}</Text>
      </View>
      <Text style={styles.title}>{allOk ? '¡Carga completada!' : 'Carga completada con errores'}</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardTotal]}>
          <Text style={styles.statValue}>{result.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={[styles.statValue, styles.statValueSuccess]}>{result.inserted}</Text>
          <Text style={styles.statLabel}>Insertados</Text>
        </View>
        <View style={[styles.statCard, styles.statCardError]}>
          <Text style={[styles.statValue, styles.statValueError]}>{result.failed}</Text>
          <Text style={styles.statLabel}>Fallidos</Text>
        </View>
      </View>
      {result.errors.length > 0 && (
        <View style={styles.errorsSection}>
          <TouchableOpacity style={styles.errorsToggle} onPress={() => setShowErrors((v) => !v)} activeOpacity={0.7}>
            <Text style={styles.errorsToggleText}>
              {showErrors ? '▲' : '▼'}  Ver {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''} de inserción
            </Text>
          </TouchableOpacity>
          {showErrors && (
            <ScrollView style={styles.errorList} nestedScrollEnabled>
              {result.errors.map((err) => (
                <View key={err.index} style={styles.errorItem}>
                  <Text style={styles.errorItemIndex}>Fila {err.index + 1}</Text>
                  <Text style={styles.errorItemReason}>{err.reason}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetText}>Nueva carga</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Sizes.gapLg, paddingVertical: Sizes.paddingLg },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  iconCircleSuccess: { backgroundColor: T.successBg },
  iconCircleWarn: { backgroundColor: T.warningBg },
  icon: { fontSize: 36 },
  title: { ...Typography.h3, color: T.textPrimary, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: Sizes.gapMd, width: '100%' },
  statCard: { flex: 1, borderRadius: Sizes.radiusMd, paddingVertical: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: T.cardBorder },
  statCardTotal: { backgroundColor: T.inputBg },
  statCardSuccess: { backgroundColor: T.successBg },
  statCardError: { backgroundColor: T.errorBg },
  statValue: { ...Typography.h2, color: T.textPrimary },
  statValueSuccess: { color: T.success },
  statValueError: { color: T.error },
  statLabel: { ...Typography.caption, color: T.textSecondary },
  errorsSection: { width: '100%', borderRadius: Sizes.radiusMd, borderWidth: 1, borderColor: T.cardBorder, overflow: 'hidden' },
  errorsToggle: { padding: Sizes.paddingMd, backgroundColor: T.errorBg },
  errorsToggleText: { ...Typography.bodySm, fontWeight: '700', color: T.error },
  errorList: { maxHeight: 200 },
  errorItem: { padding: Sizes.paddingMd, borderTopWidth: 1, borderTopColor: T.divider, gap: 2 },
  errorItemIndex: { ...Typography.caption, fontWeight: '700', color: T.textSecondary },
  errorItemReason: { ...Typography.bodySm, color: T.textPrimary },
  resetBtn: { width: '100%', height: Sizes.btnHeight, borderRadius: Sizes.radiusMd, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center' },
  resetText: { ...Typography.button, color: '#fff' },
});
