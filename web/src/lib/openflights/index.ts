import NoneNullableObject from '@lib/common/types/non-nullable-object.type';
import pick from '@lib/common/util/pick';
import _airportsData from './data.json';

export enum OpenFlightsDST {
  Europe = 'E',
  NORTH_AMERICA = 'A',
  SOUTH_AMERICA = 'S',
  AUSTRALIA = 'O',
  NEW_ZEALAND = 'Z',
  NONE = 'N',
  UNKNOWN = 'U',
}

export interface OpenFlightsAirport {
  id: number;
  name: string;
  country: string;
  city: string;
  iataCode: string | null;
  icaoCode: string | null;
  latitude: number;
  longitude: number;
  altitude: number;
  timezoneOffset: number | null;
  dst: OpenFlightsDST | null;
  timezone: string | null;
}

export type CompleteOpenFlightsAirport = NoneNullableObject<OpenFlightsAirport>;

export const airportsData = _airportsData as OpenFlightsAirport[];

export const airportsDataCompact: CompleteOpenFlightsAirport[] =
  _airportsData.filter(
    (airport) =>
      airport.iataCode !== null &&
      airport.icaoCode !== null &&
      airport.timezoneOffset !== null &&
      airport.dst !== null &&
      airport.timezone !== null,
  );

const _findByIataCodeCache = new Map<string, OpenFlightsAirport | null>();

export function findByIataCode(iataCode: string): OpenFlightsAirport | null {
  const fromCache = _findByIataCodeCache.get(iataCode);
  if (fromCache !== undefined) return fromCache;

  const airport =
    airportsData.find((value) => value.iataCode === iataCode) ?? null;

  _findByIataCodeCache.set(iataCode, airport);

  return airport;
}

function _pickDetails<T, K extends keyof T>(
  data: T[],
  keys: K[],
  cache: Map<string, Pick<T, K>[]>,
): Pick<T, K>[] {
  const sortedKeys = [...keys].sort();
  const cacheKey = JSON.stringify(sortedKeys);

  const cachedValue = cache.get(cacheKey);
  if (cachedValue) return cachedValue;

  const value = data.map((item) => pick(item, keys));
  cache.set(cacheKey, value);

  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _pickAirportDetailsCache = new Map<string, any>();

export function pickAirportDetails<K extends keyof OpenFlightsAirport>(
  ...keys: K[]
): Pick<OpenFlightsAirport, K>[] {
  return _pickDetails(airportsData, keys, _pickAirportDetailsCache);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _pickAirportDetailsCompactCache = new Map<string, any>();

export function pickAirportDetailsCompact<
  K extends keyof CompleteOpenFlightsAirport,
>(...keys: K[]): Pick<CompleteOpenFlightsAirport, K>[] {
  return _pickDetails(
    airportsDataCompact,
    keys,
    _pickAirportDetailsCompactCache,
  );
}

const openFlights = {
  airportsData,
  airportsDataCompact,
  findByIataCode,
  pickAirportDetails,
  pickAirportDetailsCompact,
};
export default openFlights;
