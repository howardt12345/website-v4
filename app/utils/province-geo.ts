import type { FeatureCollection } from 'geojson';
import type { COUNTRY_SUBDIVISION_META } from '~/utils/travel-geo';

type ProvinceLoader = () => Promise<{ default: FeatureCollection }>;

const PROVINCE_LOADERS: Record<keyof typeof COUNTRY_SUBDIVISION_META, ProvinceLoader> = {
  // East Asia
  TWN: () => import('@amcharts/amcharts5-geodata/taiwanLow'),
  JPN: () => import('@amcharts/amcharts5-geodata/japanLow'),
  KOR: () => import('@amcharts/amcharts5-geodata/southKoreaLow'),
  CHN: () => import('@amcharts/amcharts5-geodata/chinaLow'),
  // Southeast Asia
  SGP: () => import('@amcharts/amcharts5-geodata/singaporeLow'),
  THA: () => import('@amcharts/amcharts5-geodata/thailandLow'),
  VNM: () => import('@amcharts/amcharts5-geodata/vietnamLow'),
  MYS: () => import('@amcharts/amcharts5-geodata/malaysiaLow'),
  IDN: () => import('@amcharts/amcharts5-geodata/indonesiaLow'),
  PHL: () => import('@amcharts/amcharts5-geodata/philippinesLow'),
  IND: () => import('@amcharts/amcharts5-geodata/indiaLow'),
  // Oceania
  AUS: () => import('@amcharts/amcharts5-geodata/australiaLow'),
  NZL: () => import('@amcharts/amcharts5-geodata/newZealandLow'),
  // Americas
  USA: () => import('@amcharts/amcharts5-geodata/usaLow'),
  CAN: () => import('@amcharts/amcharts5-geodata/canadaLow'),
  MEX: () => import('@amcharts/amcharts5-geodata/mexicoLow'),
  BRA: () => import('@amcharts/amcharts5-geodata/brazilLow'),
  ARG: () => import('@amcharts/amcharts5-geodata/argentinaLow'),
  // Europe
  GBR: () => import('@amcharts/amcharts5-geodata/ukLow'),
  FRA: () => import('@amcharts/amcharts5-geodata/franceLow'),
  ITA: () => import('@amcharts/amcharts5-geodata/italyLow'),
  DEU: () => import('@amcharts/amcharts5-geodata/germanyLow'),
  ESP: () => import('@amcharts/amcharts5-geodata/spainLow'),
  PRT: () => import('@amcharts/amcharts5-geodata/portugalLow'),
  NLD: () => import('@amcharts/amcharts5-geodata/netherlandsLow'),
  CHE: () => import('@amcharts/amcharts5-geodata/switzerlandLow'),
  AUT: () => import('@amcharts/amcharts5-geodata/austriaLow'),
  GRC: () => import('@amcharts/amcharts5-geodata/greeceLow'),
  BEL: () => import('@amcharts/amcharts5-geodata/belgiumLow'),
  IRL: () => import('@amcharts/amcharts5-geodata/irelandLow'),
  POL: () => import('@amcharts/amcharts5-geodata/polandLow'),
  HUN: () => import('@amcharts/amcharts5-geodata/hungaryLow'),
  NOR: () => import('@amcharts/amcharts5-geodata/norwayLow'),
  SWE: () => import('@amcharts/amcharts5-geodata/swedenLow'),
  DNK: () => import('@amcharts/amcharts5-geodata/denmarkLow'),
  FIN: () => import('@amcharts/amcharts5-geodata/finlandLow'),
};

// Stores in-flight Promises so concurrent requests for the same iso3 coalesce into one fetch.
const provinceGeoCache: Record<string, Promise<FeatureCollection | null>> = {};

export function loadProvinceGeo(iso3: string): Promise<FeatureCollection | null> {
  const loader = PROVINCE_LOADERS[iso3];
  if (!loader) return Promise.resolve(null);
  provinceGeoCache[iso3] ??= loader().then((mod) => mod.default);
  return provinceGeoCache[iso3]!;
}
