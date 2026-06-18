import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { LightTheme as T } from '@/constants/design-system';

interface Props {
  imageSource: string | number;
  onClose?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANORAMA_RATIO = 2;
const PANORAMA_WIDTH = SCREEN_WIDTH * PANORAMA_RATIO;

export function Panorama360Viewer({ imageSource, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const offsetX = useRef(0);
  const [renderOffset, setRenderOffset] = useState(0);

  const clampOffset = useCallback((value: number) => {
    let v = value % SCREEN_WIDTH;
    if (v > 0) v -= SCREEN_WIDTH;
    return v;
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,
        onPanResponderMove: (_, gs) => {
          offsetX.current = clampOffset(gs.dx);
          setRenderOffset(offsetX.current);
        },
        onPanResponderRelease: () => {
          // nothing to reset, stays at current position
        },
      }),
    [clampOffset],
  );

  const imageSourceObj =
    typeof imageSource === 'string'
      ? { uri: imageSource }
      : imageSource;

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudo cargar la imagen 360°</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.loadingText}>Cargando panorama...</Text>
        </View>
      )}

      <View style={styles.panoramaWrapper}>
        <View
          style={[
            styles.panoramaRow,
            { transform: [{ translateX: renderOffset }] },
          ]}
        >
          <Image
            source={imageSourceObj}
            style={styles.panoramaImage}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
          <Image
            source={imageSourceObj}
            style={styles.panoramaImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.hintBar}>
        <Text style={styles.hintText}>🖐 Arrastra para explorar el panorama</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  panoramaWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  panoramaRow: {
    flexDirection: 'row',
    width: PANORAMA_WIDTH * 2,
    height: '100%',
  },
  panoramaImage: {
    width: PANORAMA_WIDTH,
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: T.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: T.error,
    fontSize: 15,
    textAlign: 'center',
  },
  hintBar: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: T.textPrimary,
    fontSize: 12,
  },
});
