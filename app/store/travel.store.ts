import { defineStore } from 'pinia';
import type { TravelCountry, TravelCity } from '~/composables/travel';

export const useTravelStore = defineStore('travel', () => {
  const countries = ref<TravelCountry[]>([]);

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

  const setCountries = (incoming: TravelCountry[]): void => {
    countries.value = incoming;
  };

  return { countries, iso2ToIso3, iso3ToIso2, countryByIso3, cityById, setCountries };
});
