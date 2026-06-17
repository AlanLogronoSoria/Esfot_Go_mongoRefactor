import * as Location from 'expo-location';
import type {
  IGpsLocationRepository,
  GpsCoordinates,
  GpsLocationOptions,
  GpsLocationSubscription,
} from '../domain/gps-location.repository';

export class ExpoLocationRepository implements IGpsLocationRepository {
  async getCurrentPosition(options?: Partial<GpsLocationOptions>): Promise<GpsCoordinates> {
    const accuracy = this.mapAccuracy(options?.accuracy);
    const loc = await Location.getCurrentPositionAsync({ accuracy });
    return this.toGpsCoordinates(loc);
  }

  async watchPosition(
    options: Partial<GpsLocationOptions>,
    onLocation: (coords: GpsCoordinates) => void,
  ): Promise<GpsLocationSubscription> {
    const accuracy = this.mapAccuracy(options?.accuracy);
    const sub = await Location.watchPositionAsync(
      {
        accuracy,
        distanceInterval: options.distanceInterval ?? 5,
        timeInterval: options.timeInterval ?? 2000,
      },
      (loc) => onLocation(this.toGpsCoordinates(loc)),
    );

    return {
      remove: () => { sub.remove(); },
    };
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  private mapAccuracy(accuracy?: string): Location.Accuracy {
    switch (accuracy) {
      case 'high': return Location.Accuracy.High;
      case 'low': return Location.Accuracy.Low;
      default: return Location.Accuracy.Balanced;
    }
  }

  private toGpsCoordinates(loc: Location.LocationObject): GpsCoordinates {
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitude: loc.coords.altitude ?? null,
      accuracy: loc.coords.accuracy ?? null,
      heading: loc.coords.heading ?? null,
      speed: loc.coords.speed ?? null,
      timestamp: loc.timestamp,
    };
  }
}
