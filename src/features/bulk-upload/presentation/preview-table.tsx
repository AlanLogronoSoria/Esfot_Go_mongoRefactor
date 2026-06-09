import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
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
          <Text style={styles.badgeText}>✓ {validCount} válidas</Text>
        </View>
        {invalidCount > 0 && (
          <View style={[styles.badge, styles.badgeInvalid]}>
            <Text style={[styles.badgeText, styles.badgeTextInvalid]}>✕ {invalidCount} con errores</Text>
          </View>
        )}
      </View>
      {invalidCount > 0 && (
        <View style={styles.filterRow}>
          {(['all', 'invalid'] as const).map((f) => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => { setFilter(f); setPage(0); }} activeOpacity={0.7}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todas' : 'Solo errores'}
              </Text>
            </TouchableOpacity>
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
          <TouchableOpacity style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p - 1)} disabled={page === 0}>
            <Text style={styles.pageBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{page + 1} / {totalPages}</Text>
          <TouchableOpacity style={[styles.pageBtn, page === totalPages - 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)} disabled={page === totalPages - 1}>
            <Text style={styles.pageBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, (validCount === 0 || isUploading) && styles.confirmBtnDisabled]}
          onPress={onConfirm} disabled={validCount === 0 || isUploading} activeOpacity={0.8}>
          <Text style={styles.confirmText}>
            {isUploading ? 'Subiendo…' : `Subir ${validCount} fila${validCount !== 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>
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
  filterBtnActive: { backgroundColor: T.primary },
  filterText: { ...Typography.bodySm, color: T.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  tableBody: { maxHeight: 300 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.divider, backgroundColor: T.surface },
  rowInvalid: { backgroundColor: T.errorBg },
  cell: { width: 120, paddingHorizontal: 10, paddingVertical: 10, borderRightWidth: 1, borderRightColor: T.divider, justifyContent: 'center' },
  cellIndex: { width: 44, backgroundColor: T.inputBg },
  headerText: { ...Typography.caption, color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  cellText: { ...Typography.bodySm, color: T.textPrimary },
  cellTextInvalid: { color: T.error },
  errorRow: { backgroundColor: T.errorBg, paddingHorizontal: 12, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: T.divider },
  errorRowText: { ...Typography.caption, color: T.error },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  pageBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.inputBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder },
  pageBtnDisabled: { opacity: 0.35 },
  pageBtnText: { fontSize: 16, fontWeight: '700', color: T.primary },
  pageInfo: { ...Typography.bodySm, color: T.textSecondary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Sizes.gapMd, paddingTop: Sizes.paddingSm },
  cancelBtn: { flex: 1, height: Sizes.btnHeight, borderRadius: Sizes.radiusMd, borderWidth: 1.5, borderColor: T.cardBorder, justifyContent: 'center', alignItems: 'center' },
  cancelText: { ...Typography.button, color: T.textSecondary },
  confirmBtn: { flex: 2, height: Sizes.btnHeight, borderRadius: Sizes.radiusMd, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: { ...Typography.button, color: '#fff' },
});
