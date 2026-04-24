import { defineStore } from 'pinia';
import type {
  TravelCountry,
  TravelCity,
  TravelTrip,
  TravelDay,
  TravelPhoto,
  TravelView,
  TripOverviewDay,
  TripOverviewPhoto,
  CityViewPlace,
  RawPhotoFolder,
  RawPhoto,
} from '~/types/travel';
import { tripSlug, tripsForCountry } from '~/composables/travel';

interface ParsedHash {
  countryIso3: string | null;
  tripId: string | null;
  dayDate: string | null;
  cityFocus: { country: string; city: string } | null;
}

const parseHash = (hash: string): ParsedHash => {
  const raw = hash.replace(/^#/, '');

  // country/ISO3/city/CITY_ID
  const countryWithCity = raw.match(/^country\/([A-Z]{3})\/city\/([^/]+)$/);
  if (countryWithCity) {
    return { countryIso3: countryWithCity[1]!, tripId: null, dayDate: null, cityFocus: { country: countryWithCity[1]!, city: countryWithCity[2]! } };
  }

  // country/ISO3
  const countryOnly = raw.match(/^country\/([A-Z]{3})$/);
  if (countryOnly) return { countryIso3: countryOnly[1]!, tripId: null, dayDate: null, cityFocus: null };

  const tripPrefix = raw.match(/^trip\/(.+)$/);
  if (!tripPrefix) return { countryIso3: null, tripId: null, dayDate: null, cityFocus: null };

  const tripTail = tripPrefix[1]!;

  // trip/slug/day/DATE/country/ISO3/city/CITY_ID
  const tripDayCountryCity = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})\/country\/([A-Z]{3})\/city\/([^/]+)$/);
  if (tripDayCountryCity) {
    return { countryIso3: tripDayCountryCity[3]!, tripId: tripDayCountryCity[1]!, dayDate: tripDayCountryCity[2]!, cityFocus: { country: tripDayCountryCity[3]!, city: tripDayCountryCity[4]! } };
  }

  // trip/slug/day/DATE/country/ISO3
  const tripDayCountry = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})\/country\/([A-Z]{3})$/);
  if (tripDayCountry) {
    return { countryIso3: tripDayCountry[3]!, tripId: tripDayCountry[1]!, dayDate: tripDayCountry[2]!, cityFocus: null };
  }

  // trip/slug/day/DATE
  const tripDay = tripTail.match(/^(.+)\/day\/(\d{4}-\d{2}-\d{2})$/);
  if (tripDay) return { countryIso3: null, tripId: tripDay[1]!, dayDate: tripDay[2]!, cityFocus: null };

  const tripWithCountry = tripTail.match(/^(.+)\/country\/([A-Z]{3})$/);
  if (tripWithCountry) return { countryIso3: tripWithCountry[2]!, tripId: tripWithCountry[1]!, dayDate: null, cityFocus: null };

  return { countryIso3: null, tripId: tripTail, dayDate: null, cityFocus: null };
};

export const useTravelStore = defineStore('travel', () => {
  const countries = ref<TravelCountry[]>([]);
  const trips = ref<TravelTrip[]>([]);
  const days = ref<TravelDay[]>([]);
  const photoFolders = ref<RawPhotoFolder[]>([]);
  const photos = ref<RawPhoto[]>([]);
  const hydrated = ref(false);

  const hydrate = async (): Promise<void> => {
    if (hydrated.value) return;
    const [c, t, d, f, p] = await Promise.all([
      useAsyncData('travel-countries', () => queryCollection('travelCountries').all()),
      useAsyncData('travel-trips', () => queryCollection('travelTrips').order('start', 'DESC').all()),
      useAsyncData('travel-days', () => queryCollection('travelDays').order('date', 'ASC').all()),
      useAsyncData('photo-folders', () => queryCollection('photoFolders').all()),
      useAsyncData('photos', () => queryCollection('photos').order('stem', 'ASC').all()),
    ]);
    countries.value = (c.data.value ?? []) as unknown as TravelCountry[];
    trips.value = (t.data.value ?? []) as unknown as TravelTrip[];
    days.value = (d.data.value ?? []) as unknown as TravelDay[];
    photoFolders.value = (f.data.value ?? []) as unknown as RawPhotoFolder[];
    photos.value = (p.data.value ?? []) as unknown as RawPhoto[];
    hydrated.value = true;
  };

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

  const photoFolderByPath = computed(
    () => new Map(photoFolders.value.map((f) => [f.stem.replace(/\/index$/, ''), f])),
  );

  const travelPhotosByPlace = computed<Record<string, Record<string, TravelPhoto[]>>>(() => {
    const result: Record<string, Record<string, TravelPhoto[]>> = {};
    for (const raw of photos.value) {
      const folderPath = raw.stem.split('/').slice(0, -1).join('/');
      const folder = photoFolderByPath.value.get(folderPath);
      if (!folder) continue;
      const hasTrip = !!folder.tripId;
      const hasPlace = !!folder.placeSlug;
      if (!hasTrip || !hasPlace) {
        if (import.meta.dev && (hasTrip || hasPlace)) {
          console.warn(
            `[travel] folder ${folderPath}: set both tripId and placeSlug, or neither`,
          );
        }
        continue;
      }
      const byPlace = (result[folder.tripId!] ??= {});
      (byPlace[folder.placeSlug!] ??= []).push({
        url: `/${raw.stem}.${raw.ext ?? 'jpg'}`,
        date: folder.date,
        title: raw.title,
        caption: raw.caption,
        alt: raw.alt,
        featured: raw.featured ?? false,
        tags: [...new Set([...(raw.tags ?? []), ...(folder.tags ?? [])])],
      });
    }
    return result;
  });

  const route = useRoute();
  const router = useRouter();

  const focusCountryIso3 = ref<string | null>(null);
  const focusTripId = ref<string | null>(null);
  const activeDayIndex = ref<number | null>(null);
  const pendingDayDate = ref<string | null>(null);
  const activePlaceIndex = ref(0);
  const activeCityFocus = ref<{ country: string; city: string } | null>(null);
  const mapMode = ref<'flat' | 'globe'>('flat');

  const applyHash = (hash: string): void => {
    const parsed = parseHash(hash);
    focusCountryIso3.value = parsed.countryIso3;
    focusTripId.value = parsed.tripId;
    activeCityFocus.value = parsed.cityFocus;
    pendingDayDate.value = parsed.dayDate;
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

  const tripDays = computed<TravelDay[]>(() =>
    focusTrip.value ? daysForTripSlug(tripSlug(focusTrip.value)) : [],
  );

  const resolvePendingDay = (): void => {
    if (!pendingDayDate.value || !tripDays.value.length) return;
    const idx = tripDays.value.findIndex((d) => d.date === pendingDayDate.value);
    if (idx !== -1) {
      activeDayIndex.value = idx;
      pendingDayDate.value = null;
    }
  };
  watch(tripDays, resolvePendingDay);
  watch(pendingDayDate, resolvePendingDay);
  applyHash(route.hash);
  resolvePendingDay();

  const countryTrips = computed<TravelTrip[]>(() =>
    focusCountry.value ? tripsForCountry(trips.value, focusCountry.value.iso3) : [],
  );

  const multiCountry = computed(() => (focusTrip.value?.countries.length ?? 0) > 1);
  const tripDayCount = computed(() => tripDays.value.length);
  const tripCityCount = computed(
    () =>
      new Set(
        tripDays.value.flatMap((d) =>
          d.places.map((p) => `${p.country ?? d.country}/${p.city ?? d.city}`),
        ),
      ).size,
  );

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
      for (const place of day.places) {
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
    const hue = countryByIso3(iso3)?.hue ?? 200;
    const result: CityViewPlace[] = [];
    for (const trip of trips.value) {
      const slug = tripSlug(trip);
      
      const tId = slug.split('/').at(-1) ?? slug;
      const photosForTrip = travelPhotosByPlace.value[tId] ?? {};
      for (const day of daysForTripSlug(slug)) {
        for (const place of day.places) {
          if ((place.country ?? day.country) !== iso3) continue;
          if ((place.city ?? day.city) !== cityId) continue;
          const allPhotos = place.id ? (photosForTrip[place.id] ?? []) : [];
          const photos = allPhotos.filter((p) => !p.date || p.date === day.date);
          result.push({ place, tripTitle: trip.title, dayDate: day.date, hue, photos });
        }
      }
    }
    return result;
  });

  const cityViewProps = computed(() => {
    if (view.value !== 'country' || !activeCityFocus.value) return null;
    const city = cityById(activeCityFocus.value.country, activeCityFocus.value.city);
    if (!city) return null;
    return { city, places: activeCityPlaces.value };
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
  const mapVisitedRegions = computed<string[]>(() =>
    mapFocusCountries.value.flatMap((iso3) => countryByIso3(iso3)?.regions ?? []),
  );
  const mapTripPath = computed<{ lon: number; lat: number }[] | null>(() => {
    if (view.value !== 'trip' || !tripDays.value.length) return null;
    return tripDays.value.flatMap((d) => d.places.map((p) => ({ lon: p.lon, lat: p.lat })));
  });
  const mapPlacePins = computed(() => {
    if (view.value === 'trip' && activeDay.value) {
      return activeDay.value.places.map((p, i) => ({
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
        .map((item, i) => ({
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
        return country.cities.map((c) => ({
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
    if (!activeDay.value) return null;
    if (activeCityFocus.value) return null;
    return focusCountryIso3.value;
  });

  const mapProps = computed(() => ({
    mode: mapMode.value,
    focusCountries: mapFocusCountries.value,
    visitedHues: mapVisitedHues.value,
    visitedRegions: mapVisitedRegions.value,
    tripPath: mapTripPath.value,
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
    tripDayCount: tripDayCount.value,
    tripPhotoCount: tripPhotoCount.value,
    tripCityCount: tripCityCount.value,
  }));

  const dayViewProps = computed(() => ({
    day: activeDay.value!,
    activePlace: activePlaceIndex.value,
    multiCountry: multiCountry.value,
    photosMap: tripPhotosMap.value,
  }));

  const tripOverviewProps = computed(() => ({
    trip: focusTrip.value,
    days: tripOverviewDays.value,
  }));

  return {
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
    mapProps,
    railProps,
    statsBarProps,
    dayViewProps,
    tripOverviewProps,
    cityViewProps,
    hydrate,
  };
});
