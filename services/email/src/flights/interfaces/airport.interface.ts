import GeoLocation from './geo-location.interface';

export default interface Airport {
  iataCode: string;
  name: string;
  subdivisionCode: string;
  city: string;
  geoLocation: GeoLocation;
}
