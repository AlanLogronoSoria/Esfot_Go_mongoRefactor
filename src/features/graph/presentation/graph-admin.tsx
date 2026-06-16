import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useCampusGraph, useGraphNodeMutations, useGraphEdgeMutations } from '@/features/graph/application/graph.hooks';
import type { GraphNode, GraphEdge } from '@/features/graph/domain/graph.entity';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';

export function GraphAdmin() {
  const { data: graph, isLoading } = useCampusGraph();
  const { upsertNode, deleteNode } = useGraphNodeMutations();
  const { upsertEdge, updateEdge, deleteEdge, toggleBlock } = useGraphEdgeMutations();
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [showEdgeForm, setShowEdgeForm] = useState(false);
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [editingEdge, setEditingEdge] = useState<GraphEdge | null>(null);
  const [nLabel, setNLabel] = useState('');
  const [nLat, setNLat] = useState('');
  const [nLng, setNLng] = useState('');
  const [eFrom, setEFrom] = useState('');
  const [eTo, setETo] = useState('');
  const [eWeight, setEWeight] = useState('');

  const resetNodeForm = () => { setShowNodeForm(false); setEditingNode(null); setNLabel(''); setNLat(''); setNLng(''); };
  const resetEdgeForm = () => { setShowEdgeForm(false); setEditingEdge(null); setEFrom(''); setETo(''); setEWeight(''); };

  const handleNodeSave = () => {
    if (!nLabel.trim()) return;
    upsertNode.mutateAsync(
      { id: editingNode?.id, label: nLabel.trim(), latitude: parseFloat(nLat) || 0, longitude: parseFloat(nLng) || 0 },
      { onSuccess: resetNodeForm }
    );
  };

  const handleEdgeSave = () => {
    if (!eFrom.trim() || !eTo.trim()) return;
    upsertEdge.mutateAsync(
      { id: editingEdge?.id, fromNodeId: eFrom.trim(), toNodeId: eTo.trim(), weight: parseFloat(eWeight) || 1, blocked: false, bidirectional: true },
      { onSuccess: resetEdgeForm }
    );
  };

  const startEditNode = (n: GraphNode) => { setEditingNode(n); setShowNodeForm(true); setNLabel(n.label); setNLat(String(n.latitude)); setNLng(String(n.longitude)); };
  const startEditEdge = (e: GraphEdge) => { setEditingEdge(e); setShowEdgeForm(true); setEFrom(e.fromNodeId); setETo(e.toNodeId); setEWeight(String(e.weight)); };

  if (isLoading) return <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.sectionTitle}>Nodos ({graph?.nodes.length ?? 0})</Text>
      <Pressable style={s.addBtn} onPress={() => { resetNodeForm(); setShowNodeForm(true); }}>
        <Text style={s.addBtnText}>+ Nodo</Text>
      </Pressable>
      {graph?.nodes.map((node) => (
        <View key={node.id} style={s.card}>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{node.label}</Text>
            <Text style={s.cardSub}>{node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}</Text>
          </View>
          <Pressable onPress={() => startEditNode(node)}>
            <Edit2 size={16} strokeWidth={2} color={T.primary} />
          </Pressable>
          <Pressable onPress={() => Alert.alert('Eliminar nodo', `Eliminar "${node.label}" y sus aristas?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteNode.mutate(node.id) }])}>
            <Trash2 size={16} strokeWidth={2} color={T.error} />
          </Pressable>
        </View>
      ))}

      <Text style={[s.sectionTitle, { marginTop: 20 }]}>Aristas ({graph?.edges.length ?? 0})</Text>
      <Pressable style={s.addBtn} onPress={() => { resetEdgeForm(); setShowEdgeForm(true); }}>
        <Text style={s.addBtnText}>+ Arista</Text>
      </Pressable>
      {graph?.edges.map((edge) => {
        const fromNode = graph.nodes.find((n) => n.id === edge.fromNodeId);
        const toNode = graph.nodes.find((n) => n.id === edge.toNodeId);
        return (
          <View key={edge.id} style={[s.card, edge.blocked && { opacity: 0.4 }]}>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>{fromNode?.label ?? edge.fromNodeId} → {toNode?.label ?? edge.toNodeId}</Text>
              <Text style={s.cardSub}>{edge.weight}m · {edge.bidirectional ? 'bidir' : 'unidir'} {edge.blocked ? '· BLOQUEADO' : ''}</Text>
            </View>
            <Pressable onPress={() => startEditEdge(edge)}>
              <Edit2 size={16} strokeWidth={2} color={T.primary} />
            </Pressable>
            <Pressable onPress={() => toggleBlock(edge.id, edge.blocked)}>
              <Text style={[s.actionBtn, { color: edge.blocked ? T.success : T.warning }]}>{edge.blocked ? 'Desbloq' : 'Bloq'}</Text>
            </Pressable>
            <Pressable onPress={() => deleteEdge.mutate(edge.id)}>
              <Trash2 size={16} strokeWidth={2} color={T.error} />
            </Pressable>
          </View>
        );
      })}

      {showNodeForm && (
        <View style={s.form}>
          <Text style={s.formTitle}>{editingNode ? 'Editar nodo' : 'Nuevo nodo'}</Text>
          <TextInput style={s.input} placeholder="Etiqueta" placeholderTextColor={T.inputPlaceholder} value={nLabel} onChangeText={setNLabel} />
          <View style={s.row}>
            <TextInput style={[s.input, s.half]} placeholder="Latitud" placeholderTextColor={T.inputPlaceholder} value={nLat} onChangeText={setNLat} keyboardType="numeric" />
            <TextInput style={[s.input, s.half]} placeholder="Longitud" placeholderTextColor={T.inputPlaceholder} value={nLng} onChangeText={setNLng} keyboardType="numeric" />
          </View>
          <View style={s.formActions}>
            <Pressable style={s.saveBtn} onPress={handleNodeSave}><Text style={s.saveText}>Guardar</Text></Pressable>
            <Pressable style={s.cancelBtn} onPress={resetNodeForm}><Text style={s.cancelText}>Cancelar</Text></Pressable>
          </View>
        </View>
      )}

      {showEdgeForm && (
        <View style={s.form}>
          <Text style={s.formTitle}>{editingEdge ? 'Editar arista' : 'Nueva arista'}</Text>
          <TextInput style={s.input} placeholder="ID nodo origen" placeholderTextColor={T.inputPlaceholder} value={eFrom} onChangeText={setEFrom} />
          <TextInput style={s.input} placeholder="ID nodo destino" placeholderTextColor={T.inputPlaceholder} value={eTo} onChangeText={setETo} />
          <TextInput style={s.input} placeholder="Peso (metros)" placeholderTextColor={T.inputPlaceholder} value={eWeight} onChangeText={setEWeight} keyboardType="numeric" />
          <View style={s.formActions}>
            <Pressable style={s.saveBtn} onPress={handleEdgeSave}><Text style={s.saveText}>Guardar</Text></Pressable>
            <Pressable style={s.cancelBtn} onPress={resetEdgeForm}><Text style={s.cancelText}>Cancelar</Text></Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionTitle: { ...Typography.h3, color: T.textPrimary },
  addBtn: {
    alignSelf: 'flex-start', backgroundColor: T.primary,
    borderRadius: Sizes.radiusSm, paddingHorizontal: 16, paddingVertical: 10,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.25,
  },
  addBtnText: { ...Typography.caption, fontWeight: '700', color: '#FFFFFF' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusLg,
    padding: 12, gap: 8, borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  cardBody: { flex: 1 },
  cardTitle: { ...Typography.body, fontWeight: '700', color: T.textPrimary },
  cardSub: { ...Typography.caption, color: T.textSecondary, marginTop: 2 },
  actionBtn: { ...Typography.caption, fontWeight: '700', paddingHorizontal: 4 },
  form: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusLg,
    padding: 14, gap: 10, borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.md,
  },
  formTitle: { ...Typography.h4, color: T.textPrimary },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 12, fontSize: 14, color: T.inputText,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: {
    flex: 1, backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 14, alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  saveText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
  cancelBtn: {
    flex: 1, backgroundColor: T.surface, borderRadius: Sizes.radiusSm,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder,
  },
  cancelText: { ...Typography.body, color: T.textSecondary, fontWeight: '600' },
});
