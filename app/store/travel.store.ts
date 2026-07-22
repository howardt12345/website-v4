import { defineStore } from 'pinia';
import type {
  TravelCountry,
  TravelCity,
  TravelTrip,
  TravelDay,
  TravelView,
  TripOverviewDay,
  TripOverviewPhoto,
  CityViewPlace,
  CityVisitSummary,
} from '~/types/travel';
import type { PhotoItem } from '~/types/photos';
import {
  daysLoggedForCountry,
  placeCountry,
  tripSlug,
  tripsForCountry,
  tripVisitedCityKeys,
  tripVisitedRegions,
  visiblePlaces,
} from '~/composables/travel';

interface ParsedHash {
  countryIso3: string | null;
  tripId: string | null;
  dayDate: string | null;
  cityFocus: { country: string; city: string } | null;
  stopIndex: number | null;
}

const parseHash = (hash: string): ParsedHash => {
  const stopMatch = hash.replace(/^#/, '').match(/^(.*)\/stop\/(\d+)$/);
  const raw = stopMatch ? stopMatch[1]! : hash.replace(/^#/, '');
  const stopIndex = stopMatch ? Number(stopMatch[2]) : null;

  const countryWithCity = raw.match(/^country\/([A-Z]{3})\/city\/([^/]+)$/);
  if (countryWithCity) {
    return {
      countryIso3: countryWithCity[1]!,
      tripId: null,
      dayDate: null,
      cityFocus: { country: countryWithCity[1]!, city: countryWithCity[2]! },
      stopIndex,
    };
  }

  const countryOnly = raw.match(/^country\/([A-Z]{3})$/);
  if (countryOnly) return { countryIso3: countryOnly[1]!, tripId: null, dayDate: null, cityFocus: null, stopIndex };

  const tripPrefix = raw.match(/^trip\/(.+)$/);
  if (!tripPrefix) return { countryIso3: null, tripId: null, dayDate: null, cityFocus: null, stopIndex };

  const tripTail = tripPrefix[1]!;

  const tripDayCountryCity = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})\/country\/([A-Z]{3})\/city\/([^/]+)$/);
  if (tripDayCountryCity) {
    return {
      countryIso3: tripDayCountryCity[3]!,
      tripId: tripDayCountryCity[1]!,
      dayDate: tripDayCountryCity[2]!,
      cityFocus: { country: tripDayCountryCity[3]!, city: tripDayCountryCity[4]! },
      stopIndex,
    };
  }

  const tripDayCountry = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})\/country\/([A-Z]{3})$/);
  if (tripDayCountry) {
    return { countryIso3: tripDayCountry[3]!, tripId: tripDayCountry[1]!, dayDate: tripDayCountry[2]!, cityFocus: null, stopIndex };
  }

  const tripDay = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})$/);
  if (tripDay) return { countryIso3: null, tripId: tripDay[1]!, dayDate: tripDay[2]!, cityFocus: null, stopIndex };

  const tripWithCountry = tripTail.match(/^(.+)\/country\/([A-Z]{3})$/);
  if (tripWithCountry) return { countryIso3: tripWithCountry[2]!, tripId: tripWithCountry[1]!, dayDate: null, cityFocus: null, stopIndex };

  return { countryIso3: null, tripId: tripTail, dayDate: null, cityFocus: null, stopIndex };
};

const MAP_MODE_STORAGE_KEY = 'travel:mapMode';
const readStoredMapMode = (): 'flat' | 'globe' => {
  const stored = import.meta.client ? localStorage.getItem(MAP_MODE_STORAGE_KEY) : null;
  return stored === 'flat' || stored === 'globe' ? stored : 'flat';
};

export const useTravelStore = defineStore('travel', () => {
  const allPhotos = shallowRef<PhotoItem[]>([]);

  const setPhotos = (photos: PhotoItem[]): void => {
    allPhotos.value = photos;
  };

  const countriesAsync = useAsyncData('travel-countries', () => queryCollection('travelCountries').all());
  const tripsAsync = useAsyncData('travel-trips', () => queryCollection('travelTrips').order('start', 'DESC').all());
  const daysAsync = useAsyncData('travel-days', () => queryCollection('travelDays').order('date', 'ASC').all());
  const { data: rawCountries, error: countriesError } = countriesAsync;
  const { data: rawTrips, error: tripsError } = tripsAsync;
  const { data: rawDays, error: daysError } = daysAsync;

  const countries = computed<TravelCountry[]>(
    () => (rawCountries.value ?? []) as unknown as TravelCountry[],
  );
  const trips = computed<TravelTrip[]>(
    () => (rawTrips.value ?? []) as unknown as TravelTrip[],
  );
  const days = computed<TravelDay[]>(
    () => (rawDays.value ?? []) as unknown as TravelDay[],
  );

  // Await the requests directly. A `watch` on `pending` never fires during SSR
  // (no watcher flush), which would hang the /travel prerender forever.
  const hydrate = (): Promise<unknown> => Promise.all([countriesAsync, tripsAsync, daysAsync]);

  const loadError = computed(() => countriesError.value ?? tripsError.value ?? daysError.value ?? null);
  const reload = (): Promise<unknown> =>
    Promise.all([countriesAsync.refresh(), tripsAsync.refresh(), daysAsync.refresh()]);

  const iso2ToIso3 = computed<Record<string, string>>(() =>
    Object.fromEntries(countries.value.map((c) => [c.iso2, c.iso3])),
  );
  const iso3ToIso2 = computed<Record<string, string>>(() =>
    Object.fromEntries(countries.value.map((c) => [c.iso3, c.iso2])),
  );

  const countryByIso3 = (iso3: string): TravelCountry | undefined =>
    countries.value.find((c) => c.iso3 === iso3);

  const cityById = (iso3: string, cityId: string): TravelCity | undefined =>
    countryByIso3(iso3)?.cities.find((c) => c.id === cityId);

  const tripBySlug = (slug: string): TravelTrip | undefined =>
    trips.value.find((t) => tripSlug(t) === slug);

  const daysForTripSlug = (slug: string): TravelDay[] => {
    const prefix = `${slug}/days/`;
    return days.value.filter((d) => d.stem.startsWith(prefix));
  };

  const travelPhotosByPlace = computed<Record<string, Record<string, PhotoItem[]>>>(() => {
    const result: Record<string, Record<string, PhotoItem[]>> = {};
    for (const photo of allPhotos.value) {
      if (!photo.tripId || !photo.placeSlug) continue;
      const byPlace = (result[photo.tripId] ??= {});
      (byPlace[photo.placeSlug] ??= []).push(photo);
    }
    return result;
  });

  const route = useRoute();
  const router = useRouter();

  const focusCountryIso3 = ref<string | null>(null);
  const focusTripId = ref<string | null>(null);
  const activeDayIndex = ref<number | null>(null);
  const pendingDayDate = ref<string | null>(null);
  const pendingStopIndex = ref<number | null>(null);
  const activePlaceIndex = ref(0);
  const activeCityFocus = ref<{ country: string; city: string } | null>(null);
  const mapMode = ref<'flat' | 'globe'>(readStoredMapMode());
  watch(mapMode, (mode) => {
    if (import.meta.client) localStorage.setItem(MAP_MODE_STORAGE_KEY, mode);
  });

  const applyHash = (hash: string): void => {
    const parsed = parseHash(hash);
    focusCountryIso3.value = parsed.countryIso3;
    focusTripId.value = parsed.tripId;
    activeCityFocus.value = parsed.cityFocus;
    pendingDayDate.value = parsed.dayDate;
    pendingStopIndex.value = parsed.stopIndex;
  };

  watch(() => route.hash, (hash) => {
    activeDayIndex.value = null;
    activePlaceIndex.value = 0;
    applyHash(hash);
    resolvePendingDay();
  });

  const view = computed<TravelView>(() => {
    if (focusTripId.value) return 'trip';
    if (focusCountryIso3.value) return 'country';
    return 'world';
  });

  const focusCountry = computed<TravelCountry | undefined>(() =>
    focusCountryIso3.value ? countryByIso3(focusCountryIso3.value) : undefined,
  );

  const focusTrip = computed<TravelTrip | undefined>(() =>
    focusTripId.value ? tripBySlug(focusTripId.value) : undefined,
  );

  const navWorld = (): void => { router.push({ hash: '' }); };
  const navCountry = (iso3: string): void => { router.push({ hash: `#country/${iso3}` }); };
  const navCity = (iso3: string, cityId: string): void => { router.push({ hash: `#country/${iso3}/city/${cityId}` }); };
  const navTripDayCity = (dayDate: string, country: string, cityId: string): void => {
    if (!focusTripId.value) return;
    router.push({ hash: `#trip/${focusTripId.value}/day/${dayDate}/country/${country}/city/${cityId}` });
  };
  const navTrip = (slug: string): void => {
    const countryParam = focusCountryIso3.value ? `/country/${focusCountryIso3.value}` : '';
    router.push({ hash: `#trip/${slug}${countryParam}` });
  };
  const pickDay = (idx: number | null): void => {
    if (!focusTripId.value) return;
    const countryPart = focusCountryIso3.value ? `/country/${focusCountryIso3.value}` : '';
    const hash = idx !== null && tripDays.value[idx]
      ? `#trip/${focusTripId.value}/day/${tripDays.value[idx]!.date}${countryPart}`
      : `#trip/${focusTripId.value}${countryPart}`;
    router.push({ hash });
  };
  const pickStop = (i: number): void => {
    if (!focusTripId.value || !activeDay.value) return;
    const base = route.hash.replace(/\/stop\/\d+$/, '');
    router.replace({ hash: `${base}/stop/${i}` });
  };

  const tripDays = computed<TravelDay[]>(() =>
    focusTrip.value ? daysForTripSlug(tripSlug(focusTrip.value)) : [],
  );

  const applyPendingStop = (day: TravelDay): void => {
    if (pendingStopIndex.value === null) return;
    const maxIdx = visiblePlaces(day).length - 1;
    activePlaceIndex.value = maxIdx >= 0 ? Math.min(Math.max(pendingStopIndex.value, 0), maxIdx) : 0;
    pendingStopIndex.value = null;
  };

  const resolvePendingDay = (): void => {
    if (!pendingDayDate.value || !tripDays.value.length) return;
    const idx = tripDays.value.findIndex((d) => d.date === pendingDayDate.value);
    if (idx !== -1) {
      activeDayIndex.value = idx;
      pendingDayDate.value = null;
      applyPendingStop(tripDays.value[idx]!);
    }
  };
  watch(tripDays, resolvePendingDay);
  watch(pendingDayDate, resolvePendingDay);
  applyHash(route.hash);
  resolvePendingDay();

  const countryTrips = computed<TravelTrip[]>(() =>
    focusCountry.value ? tripsForCountry(trips.value, focusCountry.value.iso3) : [],
  );
  const countryDayCount = computed(() =>
    focusCountry.value ? daysLoggedForCountry(days.value, focusCountry.value.iso3) : 0,
  );

  const multiCountry = computed(() => (focusTrip.value?.countries.length ?? 0) > 1);
  const tripDayCount = computed(() => tripDays.value.length);
  const tripCityKeys = computed<Set<string>>(() => tripVisitedCityKeys(tripDays.value));
  const tripCityCount = computed(() => tripCityKeys.value.size);
  const tripRegionCount = computed(() => tripVisitedRegions(tripDays.value, countryByIso3).length);

  const activeTripId = computed(() =>
    focusTrip.value ? (tripSlug(focusTrip.value).split('/').at(-1) ?? '') : '',
  );
  const tripPhotosMap = computed(() => travelPhotosByPlace.value[activeTripId.value] ?? {});
  const tripPhotoCount = computed(() =>
    Object.values(tripPhotosMap.value).reduce((sum, group) => sum + group.length, 0),
  );

  const tripOverviewDays = computed<TripOverviewDay[]>(() => {
    if (view.value !== 'trip' || !focusTrip.value) return [];
    const result: TripOverviewDay[] = [];
    tripDays.value.forEach((day, dayIndex) => {
      const photos: TripOverviewPhoto[] = [];
      for (const place of visiblePlaces(day)) {
        if (!place.id) continue;
        for (const photo of tripPhotosMap.value[place.id] ?? []) {
          if (photo.date && photo.date !== day.date) continue;
          photos.push({ photo, placeName: place.name });
        }
      }
      result.push({ day, dayIndex, photos });
    });
    return result;
  });

  const activeCityPlaces = computed<CityViewPlace[]>(() => {
    if (view.value !== 'country' || !activeCityFocus.value) return [];
    const { country: iso3, city: cityId } = activeCityFocus.value;
    const result: CityViewPlace[] = [];
    for (const trip of trips.value) {
      const slug = tripSlug(trip);
      const tId = slug.split('/').at(-1) ?? slug;
      const photosForTrip = travelPhotosByPlace.value[tId] ?? {};
      for (const day of daysForTripSlug(slug)) {
        for (const place of visiblePlaces(day)) {
          if (placeCountry(day, place) !== iso3) continue;
          if ((place.city ?? day.city) !== cityId) continue;
          const placePhotos = place.id ? (photosForTrip[place.id] ?? []) : [];
          const photos = placePhotos.filter((p) => !p.date || p.date === day.date);
          result.push({ place, tripTitle: trip.title, dayDate: day.date, photos });
        }
      }
    }
    return result;
  });

  const cityViewProps = computed(() => {
    if (view.value !== 'country' || !activeCityFocus.value) return null;
    const iso3 = activeCityFocus.value.country;
    const city = cityById(iso3, activeCityFocus.value.city);
    if (!city) return null;
    return { city, countryName: countryByIso3(iso3)?.name, places: activeCityPlaces.value };
  });

  const visitedCitySummaries = computed<CityVisitSummary[]>(() => {
    const stats = new Map<string, {
      country: TravelCountry;
      city: TravelCity;
      visitCount: number;
      tripSlugs: Set<string>;
      placeKeys: Set<string>;
      lastVisited: string;
    }>();

    for (const day of days.value) {
      const tripSlugFromDay = day.stem.replace(/\/days\/[^/]+$/, '');
      const citiesSeenToday = new Set<string>();

      for (const place of visiblePlaces(day)) {
        const iso3 = placeCountry(day, place);
        const cityId = place.city ?? day.city;
        const country = countryByIso3(iso3);
        const city = country?.cities.find((c) => c.id === cityId);
        if (!country || !city) continue;

        const cityKey = `${iso3}/${cityId}`;
        if (!stats.has(cityKey)) {
          stats.set(cityKey, {
            country,
            city,
            visitCount: 0,
            tripSlugs: new Set(),
            placeKeys: new Set(),
            lastVisited: day.date,
          });
        }
        const entry = stats.get(cityKey)!;

        entry.placeKeys.add(place.id ?? place.name);

        if (!citiesSeenToday.has(cityKey)) {
          citiesSeenToday.add(cityKey);
          entry.visitCount++;
          entry.tripSlugs.add(tripSlugFromDay);
          if (day.date > entry.lastVisited) entry.lastVisited = day.date;
        }
      }
    }

    return [...stats.values()]
      .map(({ tripSlugs, placeKeys, ...rest }) => ({
        ...rest,
        tripCount: tripSlugs.size,
        placeCount: placeKeys.size,
      }))
      .sort((a, b) => b.visitCount - a.visitCount || a.city.name.localeCompare(b.city.name));
  });

  const citiesOverviewProps = computed(() => {
    if (view.value === 'world') {
      return { summaries: visitedCitySummaries.value };
    }
    if (view.value === 'country' && focusCountry.value && !activeCityFocus.value) {
      const iso3 = focusCountry.value.iso3;
      return { summaries: visitedCitySummaries.value.filter((s) => s.country.iso3 === iso3) };
    }
    return null;
  });

  const railTrips = computed<TravelTrip[]>(() =>
    view.value === 'country' ? countryTrips.value : trips.value,
  );
  const activeDay = computed<TravelDay | undefined>(() =>
    activeDayIndex.value !== null ? tripDays.value[activeDayIndex.value] : undefined,
  );

  const mapFocusCountries = computed<string[]>(() => {
    if (view.value === 'country' && focusCountry.value) return [focusCountry.value.iso3];
    if (view.value === 'trip' && focusTrip.value) return focusTrip.value.countries;
    return [];
  });
  const mapVisitedHues = computed<Record<string, number>>(() =>
    Object.fromEntries(countries.value.map((c) => [c.iso3, c.hue])),
  );
  const mapVisitedRegions = computed<string[]>(() => {
    if (view.value === 'trip' && focusTrip.value) return tripVisitedRegions(tripDays.value, countryByIso3);
    return mapFocusCountries.value.flatMap((iso3) => countryByIso3(iso3)?.regions ?? []);
  });
  // Regions of the trip's countries outside this trip, e.g. a country two separate trips both visited.
  const mapDimmedRegions = computed<string[]>(() => {
    if (view.value !== 'trip' || !focusTrip.value) return [];
    const visited = new Set(mapVisitedRegions.value);
    return mapFocusCountries.value
      .flatMap((iso3) => countryByIso3(iso3)?.regions ?? [])
      .filter((region) => !visited.has(region));
  });
  const mapTripPath = computed<{ lon: number; lat: number }[] | null>(() => {
    if (view.value !== 'trip' || !tripDays.value.length) return null;
    return tripDays.value.flatMap((d) => d.places.map((p) => ({ lon: p.lon, lat: p.lat })));
  });
  // Same place list as mapTripPath (includes path-only ghosts) so the highlighted
  // segment lines up with the full-trip line it's drawn on top of.
  const mapActiveDayPath = computed<{ lon: number; lat: number }[] | null>(() => {
    if (view.value !== 'trip' || !activeDay.value) return null;
    return activeDay.value.places.map((p) => ({ lon: p.lon, lat: p.lat }));
  });
  const mapPlacePins = computed(() => {
    if (view.value === 'trip' && activeDay.value) {
      // Must index the same list day-view.vue renders, so i lines up with activePlaceIndex.
      return visiblePlaces(activeDay.value).map((p, i) => ({
        lon: p.lon,
        lat: p.lat,
        label: p.name,
        active: i === activePlaceIndex.value,
      }));
    }
    if (view.value === 'country' && activeCityFocus.value && activeCityPlaces.value.length) {
      const seen = new Set<string>();
      return activeCityPlaces.value
        .filter((item) => {
          const key = item.place.id ?? `${item.place.lon},${item.place.lat}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((item) => ({
          lon: item.place.lon,
          lat: item.place.lat,
          label: item.place.name,
          active: false,
        }));
    }
    return [];
  });
  const mapCityPins = computed(() => {
    if (view.value === 'country' && focusCountry.value) {
      return focusCountry.value.cities.map((c) => ({
        lon: c.lon,
        lat: c.lat,
        name: c.name,
        id: c.id,
        country: focusCountry.value!.iso3,
      }));
    }
    if (view.value === 'trip' && focusTrip.value && !activeDay.value) {
      return focusTrip.value.countries.flatMap((iso3) => {
        const country = countryByIso3(iso3);
        if (!country) return [];
        return country.cities
          .filter((c) => tripCityKeys.value.has(`${iso3}/${c.id}`))
          .map((c) => ({
            lon: c.lon,
            lat: c.lat,
            name: c.name,
            id: c.id,
            country: iso3,
          }));
      });
    }
    return [];
  });

  const activeCityCoords = computed<{ lon: number; lat: number } | null>(() => {
    if (!activeCityFocus.value) return null;
    const city = cityById(activeCityFocus.value.country, activeCityFocus.value.city);
    return city ? { lon: city.lon, lat: city.lat } : null;
  });

  const mapZoomCountry = computed<string | null>(() => {
    if (view.value !== 'trip') return null;
    if (activeDay.value) return null;
    if (activeCityFocus.value) return null;
    return focusCountryIso3.value;
  });

  const mapProps = computed(() => ({
    mode: mapMode.value,
    focusCountries: mapFocusCountries.value,
    visitedHues: mapVisitedHues.value,
    visitedRegions: mapVisitedRegions.value,
    dimmedRegions: mapDimmedRegions.value,
    tripPath: mapTripPath.value,
    activeDayPath: mapActiveDayPath.value,
    placePins: mapPlacePins.value,
    cityPins: mapCityPins.value,
    focusCityPin: activeCityCoords.value,
    zoomCountry: mapZoomCountry.value,
  }));

  const railProps = computed(() => ({
    view: view.value,
    trips: railTrips.value,
    tripDays: tripDays.value,
    activeDayIndex: activeDayIndex.value,
    focusCountryName: focusCountry.value?.name,
    focusTrip: focusTrip.value,
  }));

  const statsBarProps = computed(() => ({
    view: view.value,
    trips: trips.value,
    country: focusCountry.value,
    trip: focusTrip.value,
    countryDayCount: countryDayCount.value,
    tripDayCount: tripDayCount.value,
    tripPhotoCount: tripPhotoCount.value,
    tripCityCount: tripCityCount.value,
    tripRegionCount: tripRegionCount.value,
    multiCountry: multiCountry.value,
  }));

  const dayViewProps = computed(() =>
    activeDay.value
      ? {
          day: activeDay.value,
          activePlace: activePlaceIndex.value,
          multiCountry: multiCountry.value,
          photosMap: tripPhotosMap.value,
        }
      : null,
  );

  const tripOverviewProps = computed(() => ({
    trip: focusTrip.value,
    days: tripOverviewDays.value,
  }));

  return {
    setPhotos,
    countries,
    trips,
    days,
    iso2ToIso3,
    iso3ToIso2,
    countryByIso3,
    cityById,
    tripBySlug,
    daysForTripSlug,
    travelPhotosByPlace,
    view,
    focusCountry,
    focusTrip,
    activeDay,
    activePlaceIndex,
    activeCityFocus,
    mapMode,
    navWorld,
    navCountry,
    navCity,
    navTripDayCity,
    navTrip,
    pickDay,
    pickStop,
    mapProps,
    railProps,
    statsBarProps,
    dayViewProps,
    tripOverviewProps,
    cityViewProps,
    visitedCitySummaries,
    citiesOverviewProps,
    hydrate,
    loadError,
    reload,
  };
});
