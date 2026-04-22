import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';

export interface TravelPlace {
  name: string;
  lon: number;
  lat: number;
  photos: number;
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

export const tripSlug = (trip: TravelTrip): string =>
  trip.stem.replace(/\/index$/, '');

export const tripCountryNames = (trip: TravelTrip): string[] => {
  const { countryByIso3 } = useTravelStore();
  return trip.countries.map((iso3) => countryByIso3(iso3)?.name ?? iso3);
};

const MS_PER_DAY = 86_400_000;

// +1 for inclusive counting: a trip starting and ending on the same day is 1 day.
export const daySpan = (trip: TravelTrip): number => {
  const ms = new Date(trip.end).getTime() - new Date(trip.start).getTime();
  return Math.round(ms / MS_PER_DAY) + 1;
};

export const formatTripRange = (trip: TravelTrip): string => {
  const { currentLanguage } = storeToRefs(usei18n());
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const start = new Date(trip.start).toLocaleDateString(currentLanguage.value, opts);
  const end = new Date(trip.end).toLocaleDateString(currentLanguage.value, { ...opts, year: 'numeric' });
  return `${start} \u2013 ${end}`;
};

export const formatDayLabel = (date: string): string => {
  const { currentLanguage } = storeToRefs(usei18n());
  return new Date(date).toLocaleDateString(currentLanguage.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const formatDayShort = (date: string): string => {
  const { currentLanguage } = storeToRefs(usei18n());
  return new Date(date).toLocaleDateString(currentLanguage.value, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const dayUniqueCities = (day: TravelDay): { country: string; city: string }[] => {
  const seen = new Set<string>();
  const result: { country: string; city: string }[] = [];
  for (const place of day.places) {
    const country = place.country ?? day.country;
    const city = place.city ?? day.city;
    const key = `${country}/${city}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ country, city });
    }
  }
  return result;
};

export const dayUniqueIso3s = (day: TravelDay): string[] =>
  [...new Set(day.places.map((p) => p.country ?? day.country))];

export const tripsForCountry = (trips: TravelTrip[], iso3: string): TravelTrip[] =>
  trips.filter((t) => t.countries.includes(iso3));
