export type TravelView = 'world' | 'country' | 'trip';

export interface TravelPlace {
  id?: string;
  name: string;
  lon: number;
  lat: number;
  blogSlug?: string;
  country?: string;
  city?: string;
}

export interface TravelPhoto {
  url: string;
  date?: string;
  title?: string;
  caption?: string;
  alt?: string;
  featured?: boolean;
  tags: string[];
}

export interface TravelDay {
  stem: string;
  date: string;
  country: string;
  city: string;
  places: TravelPlace[];
}

export interface TravelTrip {
  stem: string;
  title: string;
  countries: string[];
  start: string;
  end: string;
  excerpt: string;
  blogSlug?: string;
}

export interface TravelCity {
  id: string;
  name: string;
  lon: number;
  lat: number;
  region: string;
}

export interface TravelCountry {
  iso3: string;
  iso2: string;
  name: string;
  hue: number;
  regions: string[];
  cities: TravelCity[];
}

export interface TripOverviewPhoto {
  photo: TravelPhoto;
  placeName: string;
}

export interface TripOverviewDay {
  day: TravelDay;
  dayIndex: number;
  photos: TripOverviewPhoto[];
}

export interface CityViewPlace {
  place: TravelPlace;
  tripTitle: string;
  dayDate: string;
  hue: number;
  photos: TravelPhoto[];
}

export interface RawPhotoFolder {
  stem: string;
  tripId?: string;
  placeSlug?: string;
  date?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
}

export interface RawPhoto {
  stem: string;
  title?: string;
  caption?: string;
  alt?: string;
  date?: string;
  featured?: boolean;
  tags?: string[];
  aspectRatio?: number;
  ext?: string;
}
