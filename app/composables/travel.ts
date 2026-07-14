import type { TravelCountry, TravelDay, TravelPlace, TravelTrip } from '~/types/travel';

const cityKey = (iso3: string, cityId: string): string => `${iso3}/${cityId}`;

// Excludes path-only ghost places from anything that lists, counts, or titles places.
export const visiblePlaces = (day: TravelDay): TravelPlace[] =>
  day.places.filter((p) => !p.ghost);

export const tripSlug = (trip: TravelTrip): string =>
  trip.stem.replace(/\/index$/, '');

export const tripCountryNames = (
  trip: TravelTrip,
  countryByIso3: (iso3: string) => TravelCountry | undefined,
): string[] => trip.countries.map((iso3) => countryByIso3(iso3)?.name ?? iso3);

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

// A day can span more than one country (border-crossing days); `day.countries[0]`
// is the day's primary/starting country and the default for places that don't say otherwise.
export const placeCountry = (day: TravelDay, place: TravelPlace): string =>
  place.country ?? day.countries[0]!;

export const dayUniqueCities = (day: TravelDay): { country: string; city: string }[] => {
  const seen = new Set<string>();
  const result: { country: string; city: string }[] = [];
  for (const place of visiblePlaces(day)) {
    const country = placeCountry(day, place);
    const city = place.city ?? day.city;
    const key = `${country}/${city}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ country, city });
    }
  }
  return result;
};

export const dayNeighborhoods = (day: TravelDay): string[] => [
  ...new Set(
    visiblePlaces(day)
      .map((p) => p.neighborhood)
      .filter((n): n is string => Boolean(n)),
  ),
];

// "City: neighborhood → neighborhood" when the day stays in one city and any place
// names a neighborhood; otherwise the day's city name(s), e.g. "Tokyo → Kyoto".
export const dayTitle = (
  day: TravelDay,
  cityById: (iso3: string, cityId: string) => { name: string } | undefined,
): string => {
  const cities = dayUniqueCities(day);
  const neighborhoods = dayNeighborhoods(day);

  if (cities.length === 1 && neighborhoods.length > 0) {
    const city = cities[0]!;
    const cityName = cityById(city.country, city.city)?.name ?? city.city;
    return `${cityName}: ${neighborhoods.join(' → ')}`;
  }

  return cities.map((loc) => cityById(loc.country, loc.city)?.name ?? loc.city).join(' → ');
};

export const dayUniqueIso3s = (day: TravelDay): string[] =>
  [...new Set(visiblePlaces(day).map((p) => placeCountry(day, p)))];

export const tripVisitedCityKeys = (days: TravelDay[]): Set<string> =>
  new Set(days.flatMap((d) => visiblePlaces(d).map((p) => cityKey(placeCountry(d, p), p.city ?? d.city))));

// Days a given country was actually visited on, not the trip's total date span —
// a border-crossing day counts toward every country it touched.
export const daysLoggedForCountry = (days: TravelDay[], iso3: string): number =>
  days.filter((d) => d.countries.includes(iso3)).length;

export const tripVisitedRegions = (
  days: TravelDay[],
  countryByIso3: (iso3: string) => TravelCountry | undefined,
): string[] => {
  const regions = new Set<string>();
  for (const key of tripVisitedCityKeys(days)) {
    const [iso3, cityId] = key.split('/');
    const region = countryByIso3(iso3!)?.cities.find((c) => c.id === cityId)?.region;
    if (region) regions.add(region);
  }
  return [...regions];
};

export const tripsForCountry = (trips: TravelTrip[], iso3: string): TravelTrip[] =>
  trips.filter((t) => t.countries.includes(iso3));
