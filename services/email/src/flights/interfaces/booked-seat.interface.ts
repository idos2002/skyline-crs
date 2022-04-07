import CabinClass from '../enums/cabin-class.enum';

export default interface BookedSeat {
  id: string;
  cabinClass: CabinClass;
  row: number;
  column: string;
}
