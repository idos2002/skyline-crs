import GeoCoordinates from './geo-coordinates.interface';

export default interface AirportLocation {
  subdivisionCode: string;
  city: string;
  coordinates: GeoCoordinates;
}
