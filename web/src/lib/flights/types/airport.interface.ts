import AirportLocation from './airport-location.interface';

export default interface Airport {
  iataCode: string;
  icaoCode: string;
  name: string;
  location: AirportLocation;
}
