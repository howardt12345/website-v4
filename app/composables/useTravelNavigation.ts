import type { TravelTrip } from '~/composables/travel';
import { tripSlug } from '~/composables/travel';

type TravelView = 'world' | 'country' | 'trip';

const parseHash = (hash: string): { countryIso3: string | null; tripId: string | null } => {
  const raw = hash.replace(/^#/, '');

  const countryMatch = raw.match(/^country\/([A-Z]{3})$/);
  if (countryMatch) return { countryIso3: countryMatch[1]!, tripId: null };

  const tripMatch = raw.match(/^trip\/(.+?)(?:\/country\/([A-Z]{3}))?$/);
  if (tripMatch) return { countryIso3: tripMatch[2] ?? null, tripId: tripMatch[1]! };

  return { countryIso3: null, tripId: null };
};

/**
 * Manages hash-based navigation state for the travel page.
 *
 * Hash format:
 *   #country/CAN              → country view
 *   #trip/travel/trip-tw-2024 → trip view
 *   #trip/travel/trip-tw-2024/country/TWN → trip view with country breadcrumb context
 */
export const useTravelNavigation = (allTrips: Ref<TravelTrip[]>) => {
  const route = useRoute();
  const router = useRouter();

  const focusCountryIso3 = ref<string | null>(null);
  const focusTripId = ref<string | null>(null);
  const activeDayIndex = ref<number | null>(null);
  const activePlaceIndex = ref(0);
  const mapMode = ref<'flat' | 'globe'>('flat');

  const applyHash = (hash: string) => {
    const parsed = parseHash(hash);
    focusCountryIso3.value = parsed.countryIso3;
    focusTripId.value = parsed.tripId;
  };

  // Apply initial hash on composable creation.
  applyHash(route.hash);

  watch(() => route.hash, (hash) => {
    applyHash(hash);
    activeDayIndex.value = null;
    activePlaceIndex.value = 0;
  });

  const view = computed((): TravelView => {
    if (focusTripId.value) return 'trip';
    if (focusCountryIso3.value) return 'country';
    return 'world';
  });

  const focusTrip = computed<TravelTrip | undefined>(() =>
    focusTripId.value
      ? allTrips.value.find((t) => tripSlug(t) === focusTripId.value)
      : undefined,
  );

  const navWorld = () => router.replace({ hash: '' });

  const navCountry = (iso3: string) => router.replace({ hash: `#country/${iso3}` });

  const navTrip = (slug: string) => {
    const countryParam = focusCountryIso3.value ? `/country/${focusCountryIso3.value}` : '';
    router.replace({ hash: `#trip/${slug}${countryParam}` });
  };

  const onDayPick = (idx: number | null) => {
    activeDayIndex.value = idx;
    activePlaceIndex.value = 0;
  };

  return {
    focusCountryIso3,
    focusTripId,
    activeDayIndex,
    activePlaceIndex,
    mapMode,
    view,
    focusTrip,
    navWorld,
    navCountry,
    navTrip,
    onDayPick,
  };
};
