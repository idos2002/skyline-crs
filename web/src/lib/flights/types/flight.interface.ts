import AircraftModel from './aircraft-model.interface';
import CabinStatistics from './cabin-statistics.interface';

export default interface Flight {
  id: string;
  departureTerminal: string;
  departureTime: string;
  arrivalTerminal: string;
  arrivalTime: string;
  aircraftModel: AircraftModel;
  cabins: CabinStatistics[];
}
