import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useCampusGraph, useGraphNodeMutations, useGraphEdgeMutations } from '@/features/graph/application/graph.hooks';
import type { GraphNode, GraphEdge } from '@/features/graph/domain/graph.entity';
import { LightTheme as T, Shadows, Sizes } from '@/constants/design-system';

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
      <TouchableOpacity style={s.addBtn} onPress={() => { resetNodeForm(); setShowNodeForm(true); }}>
        <Text style={s.addBtnText}>+ Nodo</Text>
      </TouchableOpacity>
      {graph?.nodes.map((node) => (
        <View key={node.id} style={s.card}>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{node.label}</Text>
            <Text style={s.cardSub}>{node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}</Text>
          </View>
          <TouchableOpacity onPress={() => startEditNode(node)}><Text style={s.editBtn}>✏️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Eliminar nodo', `¿Eliminar "${node.label}" y sus aristas?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteNode.mutate(node.id) }])}>
            <Text style={s.delBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[s.sectionTitle, { marginTop: 20 }]}>Aristas ({graph?.edges.length ?? 0})</Text>
      <TouchableOpacity style={s.addBtn} onPress={() => { resetEdgeForm(); setShowEdgeForm(true); }}>
        <Text style={s.addBtnText}>+ Arista</Text>
      </TouchableOpacity>
      {graph?.edges.map((edge) => {
        const fromNode = graph.nodes.find((n) => n.id === edge.fromNodeId);
        const toNode = graph.nodes.find((n) => n.id === edge.toNodeId);
        return (
          <View key={edge.id} style={[s.card, edge.blocked && { opacity: 0.4 }]}>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>{fromNode?.label ?? edge.fromNodeId} → {toNode?.label ?? edge.toNodeId}</Text>
              <Text style={s.cardSub}>{edge.weight}m · {edge.bidirectional ? '↔' : '→'} {edge.blocked ? '· BLOQUEADO' : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => startEditEdge(edge)}><Text style={s.editBtn}>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => toggleBlock(edge.id, edge.blocked)}>
              <Text style={[s.actionBtn, { color: edge.blocked ? T.success : T.warning }]}>{edge.blocked ? '🔓' : '🔒'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteEdge.mutate(edge.id)}>
              <Text style={s.delBtn}>🗑️</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={s.saveBtn} onPress={handleNodeSave}><Text style={s.saveText}>Guardar</Text></TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={resetNodeForm}><Text style={s.cancelText}>Cancelar</Text></TouchableOpacity>
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
            <TouchableOpacity style={s.saveBtn} onPress={handleEdgeSave}><Text style={s.saveText}>Guardar</Text></TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={resetEdgeForm}><Text style={s.cancelText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 60 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: T.textPrimary },
  addBtn: { alignSelf: 'flex-start', backgroundColor: T.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: T.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: 12, padding: 12, gap: 8, ...Shadows.sm },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  cardSub: { fontSize: 11, color: T.textSecondary, marginTop: 2 },
  editBtn: { fontSize: 18, paddingHorizontal: 4 },
  actionBtn: { fontSize: 18, paddingHorizontal: 4 },
  delBtn: { fontSize: 18, paddingHorizontal: 4 },
  form: { backgroundColor: T.surface, borderRadius: 14, padding: 14, gap: 10, ...Shadows.md },
  formTitle: { fontSize: 16, fontWeight: '700', color: T.textPrimary },
  input: { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder, borderRadius: 10, padding: 12, fontSize: 14, color: T.inputText },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: T.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '700', color: T.text },
  cancelBtn: { flex: 1, backgroundColor: T.surface, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder },
  cancelText: { fontSize: 14, color: T.textSecondary },
});
