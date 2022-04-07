import Airport from './airport.interface';

export default interface Flight {
  serviceId: string;
  origin: Airport;
  destination: Airport;
  departureTime: Date;
  arrivalTime: Date;
}
