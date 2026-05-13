export interface CountrySubdivisionMeta {
  total: number;
  label: string;
}

/**
 * Static metadata for countries that have subdivision geodata in amcharts5-geodata.
 * Totals are the feature counts from each country's *Low.js geodata file.
 * Labels are derived from the geodata's TYPE property (or best-fit English equivalent).
 */
export const COUNTRY_SUBDIVISION_META: Record<string, CountrySubdivisionMeta> = {
  // East Asia
  JPN: { total: 47, label: 'prefectures' },          // TYPE: Prefecture
  KOR: { total: 17, label: 'provinces & cities' },    // TYPE: Province, Metropolitan City, Special City, etc.
  TWN: { total: 22, label: 'counties' },              // TYPE: Special Municipality, County, City
  CHN: { total: 34, label: 'provinces' },             // TYPE: Province, Municipality, Autonomous Region, SAR
  // Southeast Asia
  THA: { total: 79, label: 'provinces' },             // TYPE: Province, Metropolitan Administration, etc.
  VNM: { total: 64, label: 'provinces' },             // TYPE: Tỉnh / thành phố (province / municipality)
  MYS: { total: 17, label: 'states & territories' },  // TYPE: State, Federal Territory
  IDN: { total: 38, label: 'provinces' },             // TYPE: Propinsi, Capital District, etc.
  PHL: { total: 82, label: 'provinces' },             // TYPE: Province, Capital Region
  IND: { total: 36, label: 'states & territories' },  // TYPE: State, Union Territory
  SGP: { total: 5,  label: 'regions' },               // 5 community development council regions
  // Oceania
  AUS: { total: 8,  label: 'states & territories' },  // TYPE: State, Territory
  NZL: { total: 17, label: 'regions' },               // TYPE: Region, Special Island Authority
  // Americas
  USA: { total: 51, label: 'states' },                // TYPE: State, Federal District (DC)
  CAN: { total: 13, label: 'provinces & territories' }, // TYPE: Province, Territory
  MEX: { total: 32, label: 'states' },                // TYPE: State, Federal District
  BRA: { total: 27, label: 'states' },                // TYPE: State, Federal District
  ARG: { total: 24, label: 'provinces' },             // TYPE: Province, National Territory, District
  // Europe
  GBR: { total: 16, label: 'nations & territories' }, // TYPE: Scotland/England/Wales/N.Ireland + Crown dependencies
  FRA: { total: 13, label: 'regions' },               // TYPE: metropolitan region
  ITA: { total: 24, label: 'regions' },               // TYPE: Region, Metropolitan Region, Nation
  DEU: { total: 16, label: 'states' },                // TYPE: State
  ESP: { total: 17, label: 'autonomous communities' }, // TYPE: Autonomous Community
  PRT: { total: 20, label: 'districts' },             // TYPE: Distrito, Região Autónoma
  NLD: { total: 12, label: 'provinces' },             // TYPE: Provincie
  CHE: { total: 27, label: 'cantons' },               // TYPE: Canton, Comune
  AUT: { total: 9,  label: 'states' },                // TYPE: State
  GRC: { total: 14, label: 'regions' },               // TYPE: Region, Autonomous State
  BEL: { total: 11, label: 'provinces' },             // TYPE: Province, Region
  IRL: { total: 27, label: 'counties' },              // TYPE: County, Nation
  POL: { total: 16, label: 'voivodeships' },          // TYPE: Voivodeship
  HUN: { total: 20, label: 'counties' },              // TYPE: County, Capital City
  NOR: { total: 18, label: 'counties' },              // TYPE: County
  SWE: { total: 21, label: 'counties' },              // TYPE: län
  DNK: { total: 5,  label: 'regions' },               // TYPE: Region
  FIN: { total: 19, label: 'regions' },               // TYPE: Region
};

/**
 * Total number of countries rendered on the world map.
 * Source: worldHigh.features.length (257) minus Antarctica (excluded by the map renderer).
 */
export const WORLD_COUNTRY_TOTAL = 256;
