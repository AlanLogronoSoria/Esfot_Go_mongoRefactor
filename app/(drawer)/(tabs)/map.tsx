import React, { useCallback, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import type { MapRegion, MapMarkerData, ClusterPoint, GeoCoordinate } from '@/features/map/domain/coordinates';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import { useMapClusters } from '@/features/map/application/map.hooks';
import { useLocation } from '@/hooks/useLocation';
import { UserMarker } from '@/features/map/presentation/user-marker';
import { LocationMarker, ClusterMarker } from '@/features/map/presentation/markers';
import { MapControls } from '@/features/map/presentation/map-controls';
import { CategoryFilter } from '@/features/map/presentation/category-filter';
import { MapSearchBar } from '@/features/map/presentation/map-search-bar';
import { LocationDetailSheet } from '@/features/map/presentation/location-detail-sheet';
import { RouteInfoCard } from '@/features/map/presentation/route-info-card';
import { BusMarker } from '@/features/polibus/presentation/bus-marker';
import { useBusRoutes, useBusLocations } from '@/features/polibus/application/bus.hooks';
import { calculateOptimalRoute } from '@/features/map/services/route-calculator';
import { useBatteryOptimizer } from '@/features/map/services/battery-optimizer';
import { useCampusGraph, useOptimalRoute } from '@/features/graph/application/graph.hooks';
import { findNearestNode, graphRouteToWaypoints } from '@/features/graph/application/graph-route.service';
import { useRouter } from 'expo-router';
import type { RouteCalculation } from '@/features/map/services/route-calculator';
import type { GraphRouteResult } from '@/features/graph/application/graph-route.service';
import { LightTheme as T, Shadows } from '@/constants/design-system';

const EPN_REGION: MapRegion = {
  latitude: -0.2095,
  longitude: -78.4905,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function isClusterPoint(item: MapMarkerData | ClusterPoint): item is ClusterPoint {
  return 'count' in item && item.count > 1;
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { location: userLocation } = useLocation();
  const battery = useBatteryOptimizer();

  const [region, setRegion] = useState<MapRegion>(EPN_REGION);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [route, setRoute] = useState<RouteCalculation | null>(null);
  const [graphRoute, setGraphRoute] = useState<GraphRouteResult | null>(null);
  const [fromNodeId, setFromNodeId] = useState<string | null>(null);
  const [toNodeId, setToNodeId] = useState<string | null>(null);

  const { data: campusGraph, error: graphError } = useCampusGraph();
  const optimalGraphRoute = useOptimalRoute(campusGraph, fromNodeId, toNodeId);
  const { clusters } = useMapClusters(region, selectedCategory);

  if (graphError) console.log('[MapScreen] Error cargando grafo:', (graphError as Error)?.message ?? graphError);

  const computeRoute = useCallback(
    (dest: GeoCoordinate) => {
      if (!userLocation) {
        console.log('[MapScreen] computeRoute: sin ubicación del usuario');
        return;
      }
      const origin: GeoCoordinate = { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude };

      if (campusGraph) {
        const fromNode = findNearestNode(campusGraph, origin);
        const toNode = findNearestNode(campusGraph, dest);
        if (fromNode && toNode && fromNode !== toNode) {
          console.log('[MapScreen] Ruta basada en grafo:', fromNode, '→', toNode);
          setFromNodeId(fromNode);
          setToNodeId(toNode);
          setRoute(null);
          return;
        }
      }

      const calc = calculateOptimalRoute(origin, dest);
      console.log('[MapScreen] Ruta directa calculada:', calc.distance, 'm');
      setRoute(calc);
      setGraphRoute(null);
      setFromNodeId(null);
      setToNodeId(null);
    },
    [userLocation, campusGraph]
  );

  React.useEffect(() => {
    if (optimalGraphRoute && campusGraph) {
      const result = graphRouteToWaypoints(campusGraph, optimalGraphRoute);
      setGraphRoute(result);
    } else if (fromNodeId && toNodeId && !optimalGraphRoute) {
      if (userLocation) {
        const dest = selectedLocation
          ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }
          : null;
        if (dest) {
          setRoute(calculateOptimalRoute(
            { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
            dest
          ));
        }
        setGraphRoute(null);
      }
    }
  }, [optimalGraphRoute, campusGraph, fromNodeId, toNodeId, userLocation, selectedLocation]);
  
  // Polibus integration
  const { data: busRoutes } = useBusRoutes();
  const activeRoute = busRoutes?.find((r) => r.isActive);
  const { data: busLocations } = useBusLocations(activeRoute?.id ?? '');

  const handleRegionChange = useCallback((r: MapRegion) => {
    setRegion(r);
  }, []);

  const handleMarkerPress = useCallback((marker: MapMarkerData) => {
    const location: CampusLocation = {
      id: marker.id,
      name: marker.title,
      description: marker.description ?? null,
      category: marker.category,
      latitude: marker.coordinate.latitude,
      longitude: marker.coordinate.longitude,
      imageUrl: marker.imageUrl ?? null,
      createdAt: '',
    };
    setSelectedLocation(location);
    computeRoute(marker.coordinate);
  }, [computeRoute]);

  const handleSelectLocation = useCallback((location: CampusLocation) => {
    setSelectedLocation(location);
    const dest: GeoCoordinate = { latitude: location.latitude, longitude: location.longitude };
    mapRef.current?.animateToRegion({ ...dest, latitudeDelta: 0.004, longitudeDelta: 0.004 }, 500);
    computeRoute(dest);
  }, [computeRoute]);

  const handleClearRoute = useCallback(() => {
    setRoute(null);
    setGraphRoute(null);
    setFromNodeId(null);
    setToNodeId(null);
    setSelectedLocation(null);
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!userLocation) return;
    setIsLocating(true);
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      600
    );
    setTimeout(() => setIsLocating(false), 1200);
  }, [userLocation]);

  const handleZoomIn = useCallback(() => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta / 1.6,
      longitudeDelta: prev.longitudeDelta / 1.6,
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.6,
      longitudeDelta: prev.longitudeDelta * 1.6,
    }));
  }, []);

  const skipAnimation = useMemo(() => battery.shouldSkipAnimation(), [battery]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={EPN_REGION}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        pitchEnabled={false}
      >
        {userLocation && <UserMarker location={userLocation} />}

        {clusters.map((item) => {
          if (isClusterPoint(item)) {
            return (
              <ClusterMarker
                key={item.id}
                id={item.id}
                coordinate={item.coordinate}
                count={item.count}
                topCategory={item.topCategory}
              />
            );
          }
          return (
            <LocationMarker
              key={item.id}
              marker={item}
              onPress={handleMarkerPress}
              tracksViewChanges={!skipAnimation}
            />
          );
        })}

        {busLocations?.map((bus) => (
          <BusMarker key={bus.id} bus={bus} color={activeRoute?.color} />
        ))}

        {(route || graphRoute) && (route?.waypoints.length ?? graphRoute?.waypoints.length ?? 0) > 1 && (
          <Polyline
            coordinates={graphRoute ? graphRoute.waypoints : route!.waypoints}
            strokeColor={graphRoute ? T.success : T.primary}
            strokeWidth={graphRoute ? 5 : 4}
            lineDashPattern={graphRoute ? undefined : [8, 6]}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {(route || graphRoute) && (
          <LocationMarker
            key="route-dest"
            marker={{
              id: 'route-dest',
              coordinate: route?.destination ?? (graphRoute ? graphRoute.waypoints[graphRoute.waypoints.length - 1] : { latitude: 0, longitude: 0 }),
              title: selectedLocation?.name ?? 'Destino',
              description: graphRoute ? `${graphRoute.distance}m · ${graphRoute.nodeCount} nodos` : `${Math.round(route?.distance ?? 0)}m`,
              category: 'otro',
              clusterWeight: 0,
            }}
            tracksViewChanges={false}
          />
        )}
      </MapView>

      {/* Top Header Area */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.searchWrap}>
            <MapSearchBar onSelectLocation={handleSelectLocation} />
          </View>
        </View>
        <View style={styles.filterWrap}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
      </View>

      {/* Route Info */}
      <RouteInfoCard route={route} graphRoute={graphRoute} isVisible={!!(route || graphRoute)} onClear={handleClearRoute} />

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMyLocation={handleMyLocation}
          isLocating={isLocating}
        />
      </View>

      {/* Recenter FAB */}
      <TouchableOpacity
        style={styles.recenterFab}
        onPress={handleMyLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.recenterIcon}>⊙</Text>
      </TouchableOpacity>

      {/* Location Detail Sheet */}
      <LocationDetailSheet
        location={selectedLocation}
        onClose={() => {
          setSelectedLocation(null);
          setRoute(null);
        }}
        onNavigate={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 12,
    gap: 8,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: T.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  menuIcon: {
    fontSize: 18,
    color: T.primary,
    fontWeight: '700',
  },
  searchWrap: { flex: 1 },
  filterWrap: { paddingLeft: 50 },

  controlsContainer: {
    position: 'absolute',
    right: 12,
    top: Platform.OS === 'ios' ? 180 : 170,
    zIndex: 99,
  },

  recenterFab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.lg,
    zIndex: 50,
  },
  recenterIcon: {
    fontSize: 22,
    color: T.primary,
    fontWeight: '600',
  },
});
