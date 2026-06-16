import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAdminBusRoutes } from '@/features/polibus/application/bus.hooks';
import type { BusRoute, BusStop } from '@/features/polibus/domain/route.entity';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { Edit2, Trash2, Bus } from 'lucide-react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';

export function BusRoutesAdmin() {
  const { routes, isLoading, createRoute, updateRoute, deleteRoute, createStop, updateStop, deleteStop } = useAdminBusRoutes();
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showForm, setShowForm] = useState<'route' | 'stop' | null>(null);
  const [editRoute, setEditRoute] = useState<BusRoute | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#1B6BB0');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [distance, setDistance] = useState('');
  const [direction, setDirection] = useState('');
  const [stopName, setStopName] = useState('');
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');
  const [stopOrder, setStopOrder] = useState('');

  const handleCreateRoute = useCallback(async () => {
    if (!name.trim()) return;
    await createRoute.mutateAsync({
      name: name.trim(),
      description: desc || null,
      color,
      isActive: true,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) || null : null,
      distance: distance ? parseFloat(distance) || null : null,
      direction: direction.trim() || null,
    });
    setName(''); setDesc(''); setColor('#1B6BB0');
    setEstimatedTime(''); setDistance(''); setDirection('');
    setShowForm(null);
  }, [name, desc, color, estimatedTime, distance, direction, createRoute]);

  const handleUpdateRoute = useCallback(async () => {
    if (!editRoute || !name.trim()) return;
    await updateRoute.mutateAsync({ id: editRoute.id, input: {
      name: name.trim(),
      description: desc || null,
      color,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) || null : null,
      distance: distance ? parseFloat(distance) || null : null,
      direction: direction.trim() || null,
    }});
    setEditRoute(null); setName(''); setDesc('');
    setEstimatedTime(''); setDistance(''); setDirection('');
  }, [editRoute, name, desc, color, estimatedTime, distance, direction, updateRoute]);

  const handleDeleteRoute = useCallback((route: BusRoute) => {
    Alert.alert('Eliminar ruta', `¿Eliminar "${route.name}" y todas sus paradas?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoute.mutate(route.id) },
    ]);
  }, [deleteRoute]);

  const handleCreateStop = useCallback(async () => {
    if (!selectedRoute || !stopName.trim()) return;

    const lat = parseFloat(stopLat);
    const lng = parseFloat(stopLng);
    const order = parseInt(stopOrder, 10);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      console.log('[BusRoutesAdmin] Latitud invalida:', stopLat);
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      console.log('[BusRoutesAdmin] Longitud invalida:', stopLng);
      return;
    }

    await createStop.mutateAsync({
      routeId: selectedRoute.id,
      name: stopName.trim(),
      latitude: lat,
      longitude: lng,
      stopOrder: isNaN(order) ? 0 : order,
    });
    setStopName(''); setStopLat(''); setStopLng(''); setStopOrder(''); setShowForm(null);
  }, [selectedRoute, stopName, stopLat, stopLng, stopOrder, createStop]);

  const startEditRoute = useCallback((route: BusRoute) => {
    setEditRoute(route);
    setName(route.name);
    setDesc(route.description ?? '');
    setColor(route.color);
    setEstimatedTime(route.estimatedTime?.toString() ?? '');
    setDistance(route.distance?.toString() ?? '');
    setDirection(route.direction ?? '');
  }, []);

  if (isLoading) return <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Gestión de Rutas</Text>
        <AppButton size="sm" label="+ Ruta" onPress={() => { setShowForm('route'); setName(''); setDesc(''); setColor('#1B6BB0'); setEstimatedTime(''); setDistance(''); setDirection(''); }} />
      </View>

      {routes.map((route) => (
        <AppCard key={route.id} style={[!route.isActive && { opacity: 0.5 }, s.routeCard]}>
          <View style={s.cardHeader}>
            <View style={[s.colorDot, { backgroundColor: route.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.routeName}>{route.name}</Text>
              {route.description && <Text style={s.routeDesc}>{route.description}</Text>}
              {(route.estimatedTime || route.distance || route.direction) && (
                <View style={s.routeMeta}>
                  {route.direction && <Text style={s.routeMetaText}>{route.direction}</Text>}
                  {route.estimatedTime && <Text style={s.routeMetaText}>{route.estimatedTime} min</Text>}
                  {route.distance && <Text style={s.routeMetaText}>{(route.distance / 1000).toFixed(1)} km</Text>}
                </View>
              )}
            </View>
            <View style={s.routeActions}>
              <AppButton label="" variant="ghost" size="sm" icon={<Edit2 size={16} color={T.textSecondary} />} onPress={() => startEditRoute(route)} />
              <AppButton label="" variant="ghost" size="sm" icon={<Trash2 size={16} color={T.error} />} onPress={() => handleDeleteRoute(route)} />
            </View>
          </View>
          <View style={s.stopSection}>
            <AppButton variant="outline" size="sm" label="+ Parada" onPress={() => { setSelectedRoute(route); setShowForm('stop'); setStopName(''); setStopLat(''); setStopLng(''); setStopOrder(''); }} style={{ alignSelf: 'flex-start' }} />
          </View>
        </AppCard>
      ))}

      {routes.length === 0 && <EmptyState icon={Bus} title="No hay rutas" description="No se han configurado rutas de Polibus." />}

      {showForm === 'route' && (
        <AppCard style={{ gap: 10 }}>
          <Text style={s.formTitle}>{editRoute ? 'Editar ruta' : 'Nueva ruta'}</Text>
          <TextInput style={s.input} placeholder="Nombre" placeholderTextColor={T.inputPlaceholder} value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Descripción" placeholderTextColor={T.inputPlaceholder} value={desc} onChangeText={setDesc} />
          <TextInput style={s.input} placeholder="Color (#HEX)" placeholderTextColor={T.inputPlaceholder} value={color} onChangeText={setColor} />
          <View style={s.row}>
            <TextInput style={[s.input, s.half]} placeholder="Tiempo est. (min)" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" value={estimatedTime} onChangeText={setEstimatedTime} />
            <TextInput style={[s.input, s.half]} placeholder="Distancia (m)" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" value={distance} onChangeText={setDistance} />
          </View>
          <TextInput style={s.input} placeholder="Dirección (ej: Norte → Sur)" placeholderTextColor={T.inputPlaceholder} value={direction} onChangeText={setDirection} />
          <View style={s.formActions}>
            <AppButton style={{ flex: 1 }} label={editRoute ? 'Guardar' : 'Crear'} onPress={editRoute ? handleUpdateRoute : handleCreateRoute} />
            <AppButton style={{ flex: 1 }} variant="outline" label="Cancelar" onPress={() => { setShowForm(null); setEditRoute(null); }} />
          </View>
        </AppCard>
      )}

      {showForm === 'stop' && (
        <AppCard style={{ gap: 10 }}>
          <Text style={s.formTitle}>Nueva parada en: {selectedRoute?.name}</Text>
          <TextInput style={s.input} placeholder="Nombre de la parada" placeholderTextColor={T.inputPlaceholder} value={stopName} onChangeText={setStopName} />
          <View style={s.row}>
            <TextInput style={[s.input, s.half]} placeholder="Latitud" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" value={stopLat} onChangeText={setStopLat} />
            <TextInput style={[s.input, s.half]} placeholder="Longitud" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" value={stopLng} onChangeText={setStopLng} />
          </View>
          <TextInput style={s.input} placeholder="Orden (#)" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" value={stopOrder} onChangeText={setStopOrder} />
          <View style={s.formActions}>
            <AppButton style={{ flex: 1 }} label="Crear" onPress={handleCreateStop} />
            <AppButton style={{ flex: 1 }} variant="outline" label="Cancelar" onPress={() => setShowForm(null)} />
          </View>
        </AppCard>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.h3, color: T.textPrimary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  routeName: { ...Typography.body, fontWeight: '700', color: T.textPrimary },
  routeDesc: { ...Typography.caption, color: T.textSecondary, marginTop: 2 },
  routeMeta: { flexDirection: 'row', gap: 10, marginTop: 4 },
  routeMetaText: { ...Typography.caption, color: T.textTertiary, fontSize: 10 },
  routeActions: { flexDirection: 'row', gap: 4 },
  routeCard: { gap: 10, marginBottom: 8 },
  stopSection: { borderTopWidth: 1, borderTopColor: T.cardBorder, paddingTop: 8 },
  formTitle: { ...Typography.h4, color: T.textPrimary, marginBottom: 2 },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 12,
    fontSize: 14, color: T.inputText,
  },
  half: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
