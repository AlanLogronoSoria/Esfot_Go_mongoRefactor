import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert, TextInput,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polygon } from 'react-native-maps';
import type { MapRegion } from '@/features/map/domain/coordinates';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import { LocationMarker } from '@/features/map/presentation/markers';
import { PoiForm } from '@/features/admin/presentation/poi-form';
import { useAdminPois, useAdminZones } from '@/features/admin/application/poi.hooks';
import { poiEventBus } from '@/features/admin/application/poi-events';
import { BusRoutesAdmin } from '@/features/polibus/presentation/bus-routes-admin';
import { GraphAdmin } from '@/features/graph/presentation/graph-admin';
import type { PoiInput, PoiUpdateInput, RestrictedZone } from '@/features/admin/domain/poi.entity';
import { useAuthStore } from '@/store/auth.store';
import { RoleGuard } from '@/core/guards/role.guard';
import { DarkTheme as T, Shadows } from '@/constants/design-system';
import { Lock, Map, Bus, Edit2, Trash2, RefreshCw, AlertTriangle, Network } from 'lucide-react-native';

type AdminTab = 'mapa' | 'rutas' | 'zonas' | 'grafos';

const EPN_REGION: MapRegion = {
  latitude: -0.2095, longitude: -78.4905,
  latitudeDelta: 0.012, longitudeDelta: 0.012,
};

export default function AdminMapScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const mapRef = useRef<MapView>(null);
  const { pois, isLoading, createPoi, updatePoi, deletePoi } = useAdminPois();
  const { zones, isLoading: zonesLoading, createZone, updateZone, deleteZone } = useAdminZones();

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('mapa');
  const [selectedPoi, setSelectedPoi] = useState<CampusLocation | null>(null);
  const [newCoordinate, setNewCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      if (!editMode) return;
      setNewCoordinate(e.nativeEvent.coordinate);
      setSelectedPoi(null);
      setPanelVisible(true);
    }, [editMode]);

  const handleMarkerPress = useCallback(
    (poi: CampusLocation) => {
      if (!editMode) return;
      setSelectedPoi(poi);
      setNewCoordinate(null);
      setPanelVisible(true);
    }, [editMode]);

  const handleCreate = useCallback((input: PoiInput) => {
    createPoi.mutateAsync(input).then(() => { setPanelVisible(false); setNewCoordinate(null); });
  }, [createPoi]);

  const handleUpdate = useCallback((id: string, input: PoiUpdateInput) => {
    updatePoi.mutateAsync({ id, input }).then(() => { setPanelVisible(false); setSelectedPoi(null); });
  }, [updatePoi]);

  const handleDelete = useCallback((poi: CampusLocation) => {
    Alert.alert('Eliminar ubicación', `¿Eliminar "${poi.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deletePoi.mutateAsync(poi.id); setPanelVisible(false); setSelectedPoi(null); } },
    ]);
  }, [deletePoi]);

  return (
    <RoleGuard allowedRoles={['administrador', 'gestor']} fallback={
      <View style={gateStyles.container}>
        <Lock size={48} color={T.textSecondary} />
        <Text style={gateStyles.title}>Acceso restringido</Text>
        <Text style={gateStyles.desc}>Esta sección solo está disponible para administradores.</Text>
      </View>
    }>
      <View style={styles.container}>
        <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'mapa' && styles.tabActive]} onPress={() => setActiveTab('mapa')}>
          <Map size={18} color={activeTab === 'mapa' ? T.primary : T.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'mapa' && styles.tabTextActive]}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'rutas' && styles.tabActive]} onPress={() => setActiveTab('rutas')}>
          <Bus size={18} color={activeTab === 'rutas' ? T.primary : T.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'rutas' && styles.tabTextActive]}>Rutas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'zonas' && styles.tabActive]} onPress={() => setActiveTab('zonas')}>
          <AlertTriangle size={18} color={activeTab === 'zonas' ? T.primary : T.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'zonas' && styles.tabTextActive]}>Zonas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'grafos' && styles.tabActive]} onPress={() => setActiveTab('grafos')}>
          <Network size={18} color={activeTab === 'grafos' ? T.primary : T.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'grafos' && styles.tabTextActive]}>Grafos</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rutas' ? (
        <BusRoutesAdmin />
      ) : activeTab === 'zonas' ? (
        <View style={styles.zoneContainer}><ZonePanel zones={zones} zLoading={zonesLoading} createZone={createZone} updateZone={updateZone} deleteZone={deleteZone} /></View>
      ) : activeTab === 'grafos' ? (
        <View style={styles.zoneContainer}><GraphAdmin /></View>
      ) : (
        <>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={EPN_REGION}
        onPress={handleMapPress}
        showsUserLocation
        toolbarEnabled={false}
      >
        {pois.map((poi) => (
          <LocationMarker
            key={poi.id}
            marker={{
              id: poi.id,
              coordinate: { latitude: poi.latitude, longitude: poi.longitude },
              title: poi.name,
              description: poi.description ?? undefined,
              category: poi.category,
              clusterWeight: 1,
            }}
            onPress={() => handleMarkerPress(poi)}
          />
        ))}

        {zones
          .filter((z) => z.isActive)
          .map((zone) => (
            <Polygon
              key={zone.id}
              coordinates={zone.coordinates}
              fillColor={zone.fillColor}
              strokeColor={zone.strokeColor}
              strokeWidth={2}
            />
          ))}

        {newCoordinate && (
          <Marker
            coordinate={newCoordinate}
            pinColor="#FFB81C"
            title="Nueva ubicación"
          />
        )}
      </MapView>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolbarBtn, editMode && styles.toolbarBtnActive]}
          onPress={() => {
            setEditMode(!editMode);
            setPanelVisible(false);
            setSelectedPoi(null);
            setNewCoordinate(null);
          }}
          activeOpacity={0.7}
        >
          <Edit2 size={16} color={editMode ? T.surface : T.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[styles.toolbarBtnText, editMode && styles.toolbarBtnTextActive]}>
            {editMode ? 'Editando' : 'Editar'}
          </Text>
        </TouchableOpacity>
        {editMode && (
          <Text style={styles.hint}>Toca el mapa para agregar un POI</Text>
        )}
      </View>

      {isLoading && (
        <ActivityIndicator
          size="large"
          color={T.primary}
          style={styles.loader}
        />
      )}

      {/* POI list */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Ubicaciones ({pois.length})</Text>
          <PoiEventCounter />
        </View>

        <FlatList
          data={pois}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.poiItem, selectedPoi?.id === item.id && styles.poiItemSelected]}
              onPress={() => {
                setSelectedPoi(item);
                setNewCoordinate(null);
                setPanelVisible(true);
                mapRef.current?.animateToRegion(
                  { latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.004, longitudeDelta: 0.004 },
                  400
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.poiItemContent}>
                <Text style={styles.poiItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.poiItemCat}>{item.category}</Text>
              </View>
              {editMode && (
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={8}
                  activeOpacity={0.6}
                >
                  <Trash2 size={18} color={T.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          style={styles.poiList}
        />
      </View>

      {/* Edit/Add form */}
      {panelVisible && (
        <View style={styles.formOverlay}>
          <View style={styles.formCard}>
            <PoiForm
              initialCoordinate={newCoordinate ?? undefined}
              editingPoi={selectedPoi}
              isLoading={createPoi.isPending || updatePoi.isPending}
              onSubmit={handleCreate}
              onUpdate={handleUpdate}
              onCancel={() => {
                setPanelVisible(false);
                setSelectedPoi(null);
                setNewCoordinate(null);
              }}
            />
            {selectedPoi && (
              <TouchableOpacity
                style={styles.deletePoiBtn}
                onPress={() => handleDelete(selectedPoi)}
                activeOpacity={0.7}
              >
                <Text style={styles.deletePoiText}>Eliminar ubicación</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
        </>
      )}
      </View>
    </RoleGuard>
  );
}

function PoiEventCounter() {
  const [count, setCount] = useState(0);
  React.useEffect(() => {
    const unsub = poiEventBus.subscribe(() => setCount((c) => c + 1));
    return unsub;
  }, []);
  if (count === 0) return null;
  return (
    <View style={ecStyles.badge}>
      <RefreshCw size={12} color={T.info} style={{ marginRight: 4 }} />
      <Text style={ecStyles.text}>{count}</Text>
    </View>
  );
}

function ZonePanel({ zones, zLoading, createZone, updateZone, deleteZone }: {
  zones: RestrictedZone[];
  zLoading: boolean;
  createZone: ReturnType<typeof useAdminZones>['createZone'];
  updateZone: ReturnType<typeof useAdminZones>['updateZone'];
  deleteZone: ReturnType<typeof useAdminZones>['deleteZone'];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<RestrictedZone | null>(null);
  const [zName, setZName] = useState('');
  const [zDesc, setZDesc] = useState('');
  const [zCoords, setZCoords] = useState('');
  const [zFill, setZFill] = useState('rgba(200,16,46,0.2)');
  const [zStroke, setZStroke] = useState('#C8102E');

  const resetForm = () => { setShowForm(false); setEditTarget(null); setZName(''); setZDesc(''); setZCoords(''); setZFill('rgba(200,16,46,0.2)'); setZStroke('#C8102E'); };

  const handleSubmit = () => {
    if (!zName.trim() || !zCoords.trim()) return;
    let coords: { latitude: number; longitude: number }[];
    try { coords = JSON.parse(zCoords); } catch { Alert.alert('Error', 'Coordenadas inválidas. Usa JSON: [{"latitude":-0.21,"longitude":-78.49}]'); return; }
    if (editTarget) {
      updateZone.mutateAsync({ id: editTarget.id, input: { name: zName.trim(), description: zDesc || undefined, coordinates: coords, fillColor: zFill, strokeColor: zStroke } }).then(resetForm);
    } else {
      createZone.mutateAsync({ name: zName.trim(), description: zDesc || undefined, coordinates: coords, fillColor: zFill, strokeColor: zStroke, isActive: true }).then(resetForm);
    }
  };

  const startEdit = (z: RestrictedZone) => {
    setEditTarget(z); setShowForm(true);
    setZName(z.name); setZDesc(z.description ?? ''); setZCoords(JSON.stringify(z.coordinates));
    setZFill(z.fillColor); setZStroke(z.strokeColor);
  };

  return (
    <View style={zoneStyles.container}>
      <View style={zoneStyles.header}>
        <Text style={zoneStyles.title}>Zonas Restringidas ({zones.length})</Text>
        <TouchableOpacity style={zoneStyles.addBtn} onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={zoneStyles.addBtnText}>+ Zona</Text>
        </TouchableOpacity>
      </View>

      {zLoading && <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />}

      {zones.map((zone) => (
        <View key={zone.id} style={[zoneStyles.card, !zone.isActive && { opacity: 0.5 }]}>
          <View style={zoneStyles.cardHeader}>
            <View style={[zoneStyles.colorDot, { backgroundColor: zone.fillColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={zoneStyles.cardName}>{zone.name}</Text>
              {zone.description && <Text style={zoneStyles.cardDesc}>{zone.description}</Text>}
              <Text style={zoneStyles.cardMeta}>{zone.coordinates.length} puntos</Text>
            </View>
            <TouchableOpacity onPress={() => startEdit(zone)}><Edit2 size={18} color={T.textSecondary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Eliminar zona', `¿Eliminar "${zone.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteZone.mutate(zone.id) }])}>
              <Trash2 size={18} color={T.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {zones.length === 0 && !zLoading && <Text style={zoneStyles.empty}>No hay zonas configuradas</Text>}

      {showForm && (
        <View style={zoneStyles.formCard}>
          <Text style={zoneStyles.formTitle}>{editTarget ? 'Editar zona' : 'Nueva zona'}</Text>
          <TextInput style={zoneStyles.input} placeholder="Nombre" placeholderTextColor={T.inputPlaceholder} value={zName} onChangeText={setZName} />
          <TextInput style={zoneStyles.input} placeholder="Descripción" placeholderTextColor={T.inputPlaceholder} value={zDesc} onChangeText={setZDesc} />
          <TextInput style={[zoneStyles.input, zoneStyles.textarea]} placeholder='Coordenadas JSON: [{"latitude":-0.21,"longitude":-78.49}]' placeholderTextColor={T.inputPlaceholder} value={zCoords} onChangeText={setZCoords} multiline numberOfLines={3} textAlignVertical="top" />
          <View style={zoneStyles.row}>
            <TextInput style={[zoneStyles.input, zoneStyles.half]} placeholder="Fill color" placeholderTextColor={T.inputPlaceholder} value={zFill} onChangeText={setZFill} />
            <TextInput style={[zoneStyles.input, zoneStyles.half]} placeholder="Stroke color" placeholderTextColor={T.inputPlaceholder} value={zStroke} onChangeText={setZStroke} />
          </View>
          <View style={zoneStyles.formActions}>
            <TouchableOpacity style={zoneStyles.saveBtn} onPress={handleSubmit} disabled={createZone.isPending || updateZone.isPending}>
              {createZone.isPending || updateZone.isPending ? <ActivityIndicator color={T.text} size="small" /> : <Text style={zoneStyles.saveBtnText}>{editTarget ? 'Actualizar' : 'Crear'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={zoneStyles.cancelBtn} onPress={resetForm}><Text style={zoneStyles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const ecStyles = StyleSheet.create({
  badge: { backgroundColor: T.infoBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 11, fontWeight: '700', color: T.info },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  tabBar: { flexDirection: 'row', padding: 12, paddingBottom: 0, gap: 8 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: T.surface, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder },
  tabActive: { backgroundColor: T.primaryMuted, borderColor: T.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: T.textSecondary },
  tabTextActive: { color: T.primary },
  map: { flex: 1 },
  toolbar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 100,
  },
  toolbarBtn: {
    backgroundColor: T.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Shadows.sm,
  },
  toolbarBtnActive: { backgroundColor: T.primary },
  toolbarBtnText: { fontSize: 13, fontWeight: '700', color: T.textPrimary },
  toolbarBtnTextActive: { color: T.surface },
  hint: { fontSize: 11, color: T.textSecondary, flex: 1 },
  loader: { position: 'absolute', top: '50%', alignSelf: 'center' },
  panel: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    maxHeight: 200,
    ...Shadows.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  panelTitle: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  poiList: { maxHeight: 140 },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: T.inputBg,
    justifyContent: 'space-between',
  },
  poiItemSelected: { backgroundColor: T.infoBg, borderWidth: 1, borderColor: T.info },
  poiItemContent: { flex: 1 },
  poiItemName: { fontSize: 13, fontWeight: '600', color: T.textPrimary },
  poiItemCat: { fontSize: 10, color: T.textTertiary },
  deleteIcon: { fontSize: 16 },
  formOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 200,
  },
  formCard: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingTop: 14,
    gap: 10,
    ...Shadows.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  deletePoiBtn: { padding: 12, borderRadius: 10, backgroundColor: T.errorBg, alignItems: 'center', marginTop: 4 },
  deletePoiText: { fontSize: 14, fontWeight: '600', color: T.error },
  zoneContainer: { flex: 1 },
});

const zoneStyles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: T.textPrimary },
  addBtn: { backgroundColor: T.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: T.text },
  card: { backgroundColor: T.surface, borderRadius: 14, padding: 14, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  cardName: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  cardDesc: { fontSize: 12, color: T.textSecondary, marginTop: 2 },
  cardMeta: { fontSize: 11, color: T.textTertiary, marginTop: 2 },
  editIcon: { fontSize: 18, paddingHorizontal: 4 },
  deleteIcon: { fontSize: 18, paddingHorizontal: 4 },
  empty: { textAlign: 'center', color: T.textSecondary, marginTop: 20, fontSize: 14 },
  formCard: { backgroundColor: T.surface, borderRadius: 14, padding: 14, gap: 10, ...Shadows.md },
  formTitle: { fontSize: 16, fontWeight: '700', color: T.textPrimary, marginBottom: 4 },
  input: { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder, borderRadius: 10, padding: 12, fontSize: 14, color: T.inputText },
  textarea: { minHeight: 80 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: T.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: T.text },
  cancelBtn: { flex: 1, backgroundColor: T.surface, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder },
  cancelBtnText: { fontSize: 14, color: T.textSecondary },
});

const gateStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: T.background, gap: 12 },
  icon: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: T.textPrimary },
  desc: { fontSize: 14, color: T.textSecondary, textAlign: 'center' },
});
