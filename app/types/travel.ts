import type { PhotoItem } from '~/types/photos';

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
  photo: PhotoItem;
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
  photos: PhotoItem[];
}

