import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import type { BulkRow } from '../domain/bulk-upload.entity';

interface PreviewTableProps {
  rows: BulkRow[];
  validCount: number;
  invalidCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

const PAGE_SIZE = 20;

export function PreviewTable({ rows, validCount, invalidCount, onConfirm, onCancel, isUploading }: PreviewTableProps) {
  const [filter, setFilter] = useState<'all' | 'invalid'>('all');
  const [page, setPage] = useState(0);
  const filtered = filter === 'invalid' ? rows.filter((r) => r.status === 'invalid') : rows;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const columns = rows.length > 0 ? Object.keys(rows[0].raw) : [];

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={[styles.badge, styles.badgeValid]}>
          <Text style={styles.badgeText}>{validCount} validas</Text>
        </View>
        {invalidCount > 0 && (
          <View style={[styles.badge, styles.badgeInvalid]}>
            <Text style={[styles.badgeText, styles.badgeTextInvalid]}>{invalidCount} con errores</Text>
          </View>
        )}
      </View>
      {invalidCount > 0 && (
        <View style={styles.filterRow}>
          {(['all', 'invalid'] as const).map((f) => (
            <Pressable key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f); setPage(0);
              }}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todas' : 'Solo errores'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.row}>
            <View style={[styles.cell, styles.cellIndex]}>
              <Text style={styles.headerText}>#</Text>
            </View>
            {columns.map((col) => (
              <View key={col} style={styles.cell}>
                <Text style={styles.headerText} numberOfLines={1}>{col}</Text>
              </View>
            ))}
          </View>
          <ScrollView style={styles.tableBody} nestedScrollEnabled>
            {visible.map((row) => (
              <View key={row.index}>
                <View style={[styles.row, row.status === 'invalid' && styles.rowInvalid]}>
                  <View style={[styles.cell, styles.cellIndex]}>
                    <Text style={[styles.cellText, row.status === 'invalid' && styles.cellTextInvalid]}>{row.index + 1}</Text>
                  </View>
                  {columns.map((col) => (
                    <View key={col} style={styles.cell}>
                      <Text style={[styles.cellText, row.status === 'invalid' && styles.cellTextInvalid]} numberOfLines={1}>
                        {String(row.raw[col] ?? '')}
                      </Text>
                    </View>
                  ))}
                </View>
                {row.errors.length > 0 && (
                  <View style={styles.errorRow}>
                    <Text style={styles.errorRowText}>{row.errors.join(' · ')}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p - 1)} disabled={page === 0}>
            <ChevronLeft size={16} strokeWidth={2} color={page === 0 ? T.textMuted : T.primary} />
          </Pressable>
          <Text style={styles.pageInfo}>{page + 1} / {totalPages}</Text>
          <Pressable style={[styles.pageBtn, page === totalPages - 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)} disabled={page === totalPages - 1}>
            <ChevronRight size={16} strokeWidth={2} color={page === totalPages - 1 ? T.textMuted : T.primary} />
          </Pressable>
        </View>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onCancel();
        }}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.confirmBtn, (validCount === 0 || isUploading) && styles.confirmBtnDisabled]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onConfirm();
          }}
          disabled={validCount === 0 || isUploading}>
          <Text style={styles.confirmText}>
            {isUploading ? 'Subiendo...' : `Subir ${validCount} fila${validCount !== 1 ? 's' : ''}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Sizes.gapMd },
  summary: { flexDirection: 'row', gap: Sizes.gapSm, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Sizes.radiusFull, backgroundColor: T.successBg },
  badgeValid: { backgroundColor: T.successBg },
  badgeInvalid: { backgroundColor: T.errorBg },
  badgeText: { ...Typography.caption, color: T.success, fontWeight: '700' },
  badgeTextInvalid: { color: T.error },
  filterRow: { flexDirection: 'row', gap: Sizes.gapSm },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Sizes.radiusFull, backgroundColor: T.inputBg },
  filterBtnActive: { backgroundColor: T.primary, ...Shadows.sm },
  filterText: { ...Typography.bodySm, color: T.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  tableBody: { maxHeight: 300 },
  row: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.divider,
    backgroundColor: T.surface,
  },
  rowInvalid: { backgroundColor: T.errorBg },
  cell: {
    width: 120, paddingHorizontal: 10, paddingVertical: 10,
    borderRightWidth: 1, borderRightColor: T.divider, justifyContent: 'center',
  },
  cellIndex: { width: 44, backgroundColor: T.inputBg },
  headerText: { ...Typography.caption, color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  cellText: { ...Typography.bodySm, color: T.textPrimary },
  cellTextInvalid: { color: T.error },
  errorRow: {
    backgroundColor: T.errorBg, paddingHorizontal: 12, paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: T.divider,
  },
  errorRowText: { ...Typography.caption, color: T.error },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  pageBtn: {
    width: 36, height: 36, borderRadius: Sizes.radiusSm,
    backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  pageBtnDisabled: { opacity: 0.35 },
  pageInfo: { ...Typography.bodySm, color: T.textSecondary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Sizes.gapMd, paddingTop: Sizes.paddingSm },
  cancelBtn: {
    flex: 1, height: Sizes.btnHeight, borderRadius: Sizes.radiusMd,
    borderWidth: 1.5, borderColor: T.cardBorder,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: T.surface,
  },
  cancelText: { ...Typography.button, color: T.textSecondary },
  confirmBtn: {
    flex: 2, height: Sizes.btnHeight, borderRadius: Sizes.radiusMd,
    backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: { ...Typography.button, color: '#FFFFFF' },
});
