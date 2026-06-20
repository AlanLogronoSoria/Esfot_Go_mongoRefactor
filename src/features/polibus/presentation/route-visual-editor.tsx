import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker, Polyline } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import type { GraphNode } from '@/features/graph/domain/graph.entity';
import type { GeoCoordinate } from '@/features/map/domain/coordinates';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { AppButton } from '@/components/ui/app-button';
import { X, MapPin } from 'lucide-react-native';

const MAP_PROVIDER = Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE;

interface Props {
  nodes: GraphNode[];
  waypoints: GeoCoordinate[];
  routeColor: string;
  nodeIds: string[];
  onWaypointsChange: (waypoints: GeoCoordinate[]) => void;
  onNodeAdd?: (node: GraphNode) => void;
  onNodeRemove?: (nodeId: string) => void;
}

const SNAP_THRESHOLD = 0.0001;

export function RouteVisualEditor({
  nodes,
  waypoints,
  routeColor,
  nodeIds,
  onWaypointsChange,
  onNodeAdd,
  onNodeRemove,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [selectMode, setSelectMode] = useState<'remove' | 'add' | null>(null);
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      if (selectMode !== 'add') return;
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const nearest = nodes.find(
        (n) => Math.abs(n.latitude - latitude) < SNAP_THRESHOLD && Math.abs(n.longitude - longitude) < SNAP_THRESHOLD,
      );
      if (nearest) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onNodeAdd?.(nearest);
        setSelectMode(null);
      }
    },
    [selectMode, nodes, onNodeAdd],
  );

  const handleNodePress = useCallback(
    (node: GraphNode) => {
      if (selectMode !== 'remove') return;
      if (!nodeIds.includes(node.id)) return;
      Alert.alert('Eliminar nodo de la ruta', `¿Quitar "${node.label}" del recorrido?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onNodeRemove?.(node.id);
          },
        },
      ]);
    },
    [selectMode, nodeIds, onNodeRemove],
  );

  const onRouteNodes = useMemo(() => {
    const set = new Set(nodeIds);
    return nodes.filter((n) => set.has(n.id));
  }, [nodes, nodeIds]);

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <Text style={s.title}>
          Editor Visual · {waypoints.length} waypoints · {nodeIds.length} nodos
        </Text>
        <View style={s.toolbarRow}>
          {selectMode && (
            <Pressable style={s.cancelBtn} onPress={() => setSelectMode(null)}>
              <X size={14} strokeWidth={2} color={T.error} />
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
          )}
          {!selectMode && (
            <>
              <AppButton
                size="sm"
                variant="outline"
                label="- Quitar nodo"
                onPress={() => setSelectMode('remove')}
              />
              <AppButton
                size="sm"
                variant="outline"
                label="+ Agregar nodo"
                onPress={() => setSelectMode('add')}
              />
            </>
          )}
        </View>
      </View>

      {selectMode && (
        <View style={s.modeBanner}>
          <Text style={s.modeText}>
            {selectMode === 'remove'
              ? 'Toca un nodo azul de la ruta para quitarlo'
              : 'Toca un nodo gris del mapa para agregarlo a la ruta'}
          </Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={s.map}
        provider={MAP_PROVIDER}
        initialRegion={{
          latitude: nodes[0]?.latitude ?? -0.2095,
          longitude: nodes[0]?.longitude ?? -78.4905,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        onPress={handleMapPress}
        scrollEnabled={!selectMode}
        zoomEnabled={true}
        toolbarEnabled={false}
      >
        {nodes.map((node) => {
          const isOnRoute = nodeIds.includes(node.id);
          return (
            <Marker
              key={node.id}
              coordinate={{ latitude: node.latitude, longitude: node.longitude }}
              pinColor={isOnRoute ? '#2563EB' : '#6B7280'}
              title={node.label}
              description={isOnRoute ? 'En ruta' : undefined}
              zIndex={isOnRoute ? 150 : 80}
              onPress={() => handleNodePress(node)}
            />
          );
        })}

        {waypoints.length >= 2 && (
          <Polyline
            coordinates={waypoints}
            strokeColor={routeColor}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, gap: 8, paddingHorizontal: 4 },
  toolbar: { gap: 8, paddingHorizontal: 12, paddingTop: 4 },
  title: { ...Typography.h4, color: T.textPrimary },
  toolbarRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: T.errorBg,
  },
  cancelText: { fontSize: 12, fontWeight: '600', color: T.error },
  modeBanner: {
    backgroundColor: T.infoBg,
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: T.info,
  },
  modeText: { fontSize: 12, color: T.info, fontWeight: '600' },
  map: {
    flex: 1,
    borderRadius: Sizes.radiusMd,
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
});
