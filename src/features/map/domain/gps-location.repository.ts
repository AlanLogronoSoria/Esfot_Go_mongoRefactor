export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GpsLocationOptions {
  accuracy: 'high' | 'balanced' | 'low';
  distanceInterval: number;
  timeInterval: number;
}

export interface GpsLocationSubscription {
  remove: () => void;
}

export interface IGpsLocationRepository {
  getCurrentPosition(options?: Partial<GpsLocationOptions>): Promise<GpsCoordinates>;
  watchPosition(
    options: Partial<GpsLocationOptions>,
    onLocation: (coords: GpsCoordinates) => void,
  ): Promise<GpsLocationSubscription>;
  requestPermissions(): Promise<boolean>;
}
