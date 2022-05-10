import CabinClass from '@lib/common/types/cabin-class.enum';

export default interface CabinStatistics {
  cabinClass: CabinClass;
  seatsCount: number;
  availableSeatsCount: number;
}
