import type { TravelDay, TravelTrip } from '~/types/travel';
import { useTravelStore } from '~/store/travel.store';

export const tripSlug = (trip: TravelTrip): string =>
  trip.stem.replace(/\/index$/, '');

export const tripCountryNames = (trip: TravelTrip): string[] => {
  const { countryByIso3 } = useTravelStore();
  return trip.countries.map((iso3) => countryByIso3(iso3)?.name ?? iso3);
};

const MS_PER_DAY = 86_400_000;

export const daySpan = (trip: TravelTrip): number => {
  const ms = new Date(trip.end).getTime() - new Date(trip.start).getTime();
  return Math.round(ms / MS_PER_DAY) + 1;
};

export const formatTripRange = (trip: TravelTrip, locale: string): string => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const start = new Date(trip.start).toLocaleDateString(locale, opts);
  const end = new Date(trip.end).toLocaleDateString(locale, { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
};

export const formatDayLabel = (date: string, locale: string): string =>
  new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const formatDayShort = (date: string, locale: string): string =>
  new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

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
