import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View, StyleSheet, Pressable, Platform, Text, ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Polyline, Circle } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MapRegion, MapMarkerData, ClusterPoint, GeoCoordinate } from '@/features/map/domain/coordinates';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import { useMapClusters } from '@/features/map/application/map.hooks';
import { useLocation } from '@/hooks/useLocation';
import { GpsPermissionPrompt } from '@/features/auth/presentation/gps-permission-prompt';
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
import type { RouteCalculation } from '@/features/map/services/route-calculator';
import type { GraphRouteResult } from '@/features/graph/application/graph-route.service';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';
import { MapPin } from 'lucide-react-native';

const MAP_PROVIDER = Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE;

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
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { location: userLocation, permissionStatus, retry, error: locationError } = useLocation();
  const battery = useBatteryOptimizer();
  const initialCenteredRef = useRef(false);

  const [region, setRegion] = useState<MapRegion>(EPN_REGION);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [route, setRoute] = useState<RouteCalculation | null>(null);
  const [graphRoute, setGraphRoute] = useState<GraphRouteResult | null>(null);
  const [fromNodeId, setFromNodeId] = useState<string | null>(null);
  const [toNodeId, setToNodeId] = useState<string | null>(null);

  const fabScale = useSharedValue(1);
  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const { data: campusGraph, error: graphError } = useCampusGraph();
  const optimalGraphRoute = useOptimalRoute(campusGraph, fromNodeId, toNodeId);
  const { clusters } = useMapClusters(region, selectedCategory);

  React.useEffect(() => {
    if (userLocation && !initialCenteredRef.current && mapRef.current) {
      initialCenteredRef.current = true;
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 800);
    }
  }, [userLocation]);

  if (graphError) console.log('[MapScreen] Error cargando grafo:', (graphError as Error)?.message ?? graphError);

  const computeRoute = useCallback(
    (dest: GeoCoordinate) => {
      if (!userLocation) return;
      const origin: GeoCoordinate = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      if (campusGraph) {
        const fromNode = findNearestNode(campusGraph, origin);
        const toNode = findNearestNode(campusGraph, dest);
        if (fromNode && toNode && fromNode !== toNode) {
          setFromNodeId(fromNode); setToNodeId(toNode); setRoute(null); return;
        }
      }
      const calc = calculateOptimalRoute(origin, dest);
      setRoute(calc); setGraphRoute(null); setFromNodeId(null); setToNodeId(null);
    },
    [userLocation, campusGraph],
  );

  React.useEffect(() => {
    if (optimalGraphRoute && campusGraph) {
      setGraphRoute(graphRouteToWaypoints(campusGraph, optimalGraphRoute));
    } else if (fromNodeId && toNodeId && !optimalGraphRoute && userLocation && selectedLocation) {
      setRoute(calculateOptimalRoute(
        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
        { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude },
      ));
      setGraphRoute(null);
    }
  }, [optimalGraphRoute, campusGraph, fromNodeId, toNodeId, userLocation, selectedLocation]);

  const { data: busRoutes } = useBusRoutes();
  const activeRoute = busRoutes?.find((r) => r.isActive);
  const { data: busLocations } = useBusLocations(activeRoute?.id ?? '');

  const handleRegionChange = useCallback((r: MapRegion) => setRegion(r), []);
  const handleMarkerPress = useCallback((marker: MapMarkerData) => {
    setSelectedLocation({
      id: marker.id, name: marker.title,
      description: marker.description ?? null,
      category: marker.category,
      latitude: marker.coordinate.latitude,
      longitude: marker.coordinate.longitude,
      imageUrl: marker.imageUrl ?? null,
      createdAt: '',
    });
    computeRoute(marker.coordinate);
  }, [computeRoute]);
  const handleSelectLocation = useCallback((location: CampusLocation) => {
    setSelectedLocation(location);
    mapRef.current?.animateToRegion({
      latitude: location.latitude, longitude: location.longitude,
      latitudeDelta: 0.004, longitudeDelta: 0.004,
    }, 500);
    computeRoute({ latitude: location.latitude, longitude: location.longitude });
  }, [computeRoute]);
  const handleClearRoute = useCallback(() => {
    setRoute(null); setGraphRoute(null); setFromNodeId(null); setToNodeId(null);
    setSelectedLocation(null);
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!userLocation) return;
    setIsLocating(true);
    mapRef.current?.animateToRegion({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.005, longitudeDelta: 0.005,
    }, 600);
    setTimeout(() => setIsLocating(false), 1200);
  }, [userLocation]);
  const handleZoomIn = useCallback(() => setRegion((prev) => ({
    ...prev, latitudeDelta: prev.latitudeDelta / 1.6, longitudeDelta: prev.longitudeDelta / 1.6,
  })), []);
  const handleZoomOut = useCallback(() => setRegion((prev) => ({
    ...prev, latitudeDelta: prev.latitudeDelta * 1.6, longitudeDelta: prev.longitudeDelta * 1.6,
  })), []);
  const skipAnimation = useMemo(() => battery.shouldSkipAnimation(), [battery]);

  if (permissionStatus !== 'granted' && permissionStatus !== 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.permissionFallback}>
          <GpsPermissionPrompt
            variant="inline"
            onGranted={() => {
              retry();
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={MAP_PROVIDER}
        initialRegion={EPN_REGION}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale
        rotateEnabled={false}
        toolbarEnabled={false}
        pitchEnabled={false}
      >
        {userLocation && (
          <>
            <Circle
              center={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              radius={userLocation.coords.accuracy ?? 10}
              fillColor="rgba(0, 122, 255, 0.12)"
              strokeColor="rgba(0, 122, 255, 0.35)"
              strokeWidth={1.5}
            />
            <UserMarker location={userLocation} />
          </>
        )}
        {clusters.map((item) =>
          isClusterPoint(item) ? (
            <ClusterMarker
              key={item.id}
              id={item.id}
              coordinate={item.coordinate}
              count={item.count}
              topCategory={item.topCategory}
            />
          ) : (
            <LocationMarker
              key={item.id}
              marker={item}
              onPress={handleMarkerPress}
              tracksViewChanges={!skipAnimation}
            />
          ),
        )}
        {busLocations?.map((bus) => (
          <BusMarker key={bus.id} bus={bus} color={activeRoute?.color} />
        ))}
        {(route || graphRoute) && (route?.waypoints.length ?? graphRoute?.waypoints.length ?? 0) > 1 && (
          <Polyline
            coordinates={graphRoute ? graphRoute.waypoints : route!.waypoints}
            strokeColor={graphRoute ? T.success : T.primary}
            strokeWidth={graphRoute ? 6 : 5}
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
              coordinate: route?.destination ?? (graphRoute
                ? graphRoute.waypoints[graphRoute.waypoints.length - 1]
                : { latitude: 0, longitude: 0 }),
              title: selectedLocation?.name ?? 'Destino',
              description: graphRoute
                ? `${graphRoute.distance}m · ${graphRoute.nodeCount} nodos`
                : `${Math.round(route?.distance ?? 0)}m`,
              category: 'otro',
              clusterWeight: 0,
            }}
            tracksViewChanges={false}
          />
        )}
      </MapView>

      {/* Floating search + chips */}
      <View style={styles.floatingTop} pointerEvents="box-none">
        <View style={styles.searchWrap}>
          <MapSearchBar onSelectLocation={handleSelectLocation} />
        </View>
        <View style={styles.chipWrap}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
      </View>

      {/* Route info card */}
      <RouteInfoCard
        route={route}
        graphRoute={graphRoute}
        isVisible={!!(route || graphRoute)}
        onClear={handleClearRoute}
      />

      {/* Map controls — right edge */}
      <View style={styles.rightControls}>
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMyLocation={handleMyLocation}
          isLocating={isLocating}
        />
      </View>

      {/* Current location FAB */}
      <Animated.View style={[styles.fabWrap, { bottom: insets.bottom + 96 }, fabAnimStyle]}>
        <Pressable
          onPressIn={() => {
            fabScale.value = withSpring(0.88, { damping: 16, stiffness: 360 });
          }}
          onPressOut={() => {
            fabScale.value = withSpring(1, { damping: 20, stiffness: 300 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleMyLocation();
          }}
          style={styles.locationFab}
        >
          <MapPin size={22} strokeWidth={2.2} color={T.primary} />
        </Pressable>
      </Animated.View>

      {/* Location detail */}
      <LocationDetailSheet
        location={selectedLocation}
        onClose={() => { setSelectedLocation(null); setRoute(null); }}
        onNavigate={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  permissionFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.background,
    padding: 24,
  },

  floatingTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchWrap: {},
  chipWrap: { paddingLeft: 4 },

  rightControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 210 : 200,
    zIndex: 99,
  },

  fabWrap: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    zIndex: 50,
  },
  locationFab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: T.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.xl,
  },
});
