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
  timezone: string;
}

export const airportsData = _airportsData as OpenFlightsAirport[];

const _findByIataCodeCache = new Map<string, OpenFlightsAirport | null>();

export function findByIataCode(iataCode: string): OpenFlightsAirport | null {
  const fromCache = _findByIataCodeCache.get(iataCode);
  if (fromCache !== undefined) return fromCache;

  const airport =
    airportsData.find((value) => value.iataCode === iataCode) ?? null;

  _findByIataCodeCache.set(iataCode, airport);

  return airport;
}

const openFlights = { airportsData, findByIataCode };
export default openFlights;
