export type LocationMediaType = 'image' | '360' | undefined;

export interface CampusLocation {
  id: string;
  name: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  image?: string;
  image360?: string;
  mediaType?: LocationMediaType;
  createdAt: string;
}
