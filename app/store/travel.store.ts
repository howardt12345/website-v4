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
  RawPhotoFolder,
  RawPhoto,
} from '~/types/travel';
import { tripSlug, tripsForCountry } from '~/composables/travel';

const parseHash = (hash: string): { countryIso3: string | null; tripId: string | null } => {
  const raw = hash.replace(/^#/, '');

  const countryOnly = raw.match(/^country\/([A-Z]{3})$/);
  if (countryOnly) return { countryIso3: countryOnly[1]!, tripId: null };

  const tripPrefix = raw.match(/^trip\/(.+)$/);
  if (!tripPrefix) return { countryIso3: null, tripId: null };

  const tripTail = tripPrefix[1]!;
  const tripWithCountry = tripTail.match(/^(.+)\/country\/([A-Z]{3})$/);
  if (tripWithCountry) return { countryIso3: tripWithCountry[2]!, tripId: tripWithCountry[1]! };

  return { countryIso3: null, tripId: tripTail };
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
        title: raw.title,
        caption: raw.caption,
        alt: raw.alt,
        featured: raw.featured ?? false,
        tags: raw.tags ?? folder.tags ?? [],
      });
    }
    return result;
  });

  const route = useRoute();
  const router = useRouter();

  const focusCountryIso3 = ref<string | null>(null);
  const focusTripId = ref<string | null>(null);
  const activeDayIndex = ref<number | null>(null);
  const activePlaceIndex = ref(0);
  const mapMode = ref<'flat' | 'globe'>('flat');

  const applyHash = (hash: string): void => {
    const parsed = parseHash(hash);
    focusCountryIso3.value = parsed.countryIso3;
    focusTripId.value = parsed.tripId;
  };

  applyHash(route.hash);

  watch(() => route.hash, (hash) => {
    applyHash(hash);
    activeDayIndex.value = null;
    activePlaceIndex.value = 0;
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
  const navTrip = (slug: string): void => {
    const countryParam = focusCountryIso3.value ? `/country/${focusCountryIso3.value}` : '';
    router.push({ hash: `#trip/${slug}${countryParam}` });
  };
  const pickDay = (idx: number | null): void => {
    activeDayIndex.value = idx;
    activePlaceIndex.value = 0;
  };

  const tripDays = computed<TravelDay[]>(() =>
    focusTrip.value ? daysForTripSlug(tripSlug(focusTrip.value)) : [],
  );

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
          photos.push({ photo, placeName: place.name });
        }
      }
      if (photos.length) result.push({ day, dayIndex, photos });
    });
    return result;
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
    if (view.value !== 'trip' || !activeDay.value) return [];
    return activeDay.value.places.map((p, i) => ({
      lon: p.lon,
      lat: p.lat,
      label: p.name,
      active: i === activePlaceIndex.value,
    }));
  });
  const mapCityPins = computed(() => {
    if (view.value !== 'country' || !focusCountry.value) return [];
    return focusCountry.value.cities.map((c) => ({ lon: c.lon, lat: c.lat, name: c.name }));
  });

  const mapProps = computed(() => ({
    mode: mapMode.value,
    focusCountries: mapFocusCountries.value,
    visitedHues: mapVisitedHues.value,
    visitedRegions: mapVisitedRegions.value,
    tripPath: mapTripPath.value,
    placePins: mapPlacePins.value,
    cityPins: mapCityPins.value,
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
    mapMode,
    navWorld,
    navCountry,
    navTrip,
    pickDay,
    mapProps,
    railProps,
    statsBarProps,
    dayViewProps,
    tripOverviewProps,
    hydrate,
  };
});
