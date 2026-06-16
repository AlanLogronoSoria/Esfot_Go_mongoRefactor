import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
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
        {allOk ? (
          <Check size={36} strokeWidth={2.5} color={T.success} />
        ) : (
          <AlertTriangle size={36} strokeWidth={2} color={T.warning} />
        )}
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
          <Pressable style={styles.errorsToggle} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowErrors((v) => !v);
          }}>
            <View style={styles.errorsToggleRow}>
              {showErrors ? (
                <ChevronUp size={14} strokeWidth={2.2} color={T.error} />
              ) : (
                <ChevronDown size={14} strokeWidth={2.2} color={T.error} />
              )}
              <Text style={styles.errorsToggleText}>
                Ver {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''} de insercion
              </Text>
            </View>
          </Pressable>
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
      <Pressable style={styles.resetBtn} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onReset();
      }}>
        <Text style={styles.resetText}>Nueva carga</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', gap: Sizes.gapLg,
    paddingVertical: Sizes.paddingLg,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  iconCircleSuccess: { backgroundColor: T.successBg },
  iconCircleWarn: { backgroundColor: T.warningBg },
  title: { ...Typography.h3, color: T.textPrimary, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: Sizes.gapMd, width: '100%' },
  statCard: {
    flex: 1, borderRadius: Sizes.radiusLg,
    paddingVertical: 16, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  statCardTotal: { backgroundColor: T.surface },
  statCardSuccess: { backgroundColor: T.successBg },
  statCardError: { backgroundColor: T.errorBg },
  statValue: { ...Typography.h2, color: T.textPrimary },
  statValueSuccess: { color: T.success },
  statValueError: { color: T.error },
  statLabel: { ...Typography.caption, color: T.textSecondary },
  errorsSection: {
    width: '100%', borderRadius: Sizes.radiusMd,
    borderWidth: 1, borderColor: T.cardBorder, overflow: 'hidden',
  },
  errorsToggle: {
    padding: Sizes.paddingMd, backgroundColor: T.errorBg,
  },
  errorsToggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  errorsToggleText: {
    ...Typography.bodySm, fontWeight: '700', color: T.error,
  },
  errorList: { maxHeight: 200 },
  errorItem: {
    padding: Sizes.paddingMd, borderTopWidth: 1,
    borderTopColor: T.divider, gap: 2,
  },
  errorItemIndex: {
    ...Typography.caption, fontWeight: '700', color: T.textSecondary,
  },
  errorItemReason: { ...Typography.bodySm, color: T.textPrimary },
  resetBtn: {
    width: '100%', height: Sizes.btnHeight, borderRadius: Sizes.radiusMd,
    backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  resetText: { ...Typography.button, color: '#FFFFFF' },
});
