import CabinClass from '@flights/enums/cabin-class.enum';

export default interface Seat {
  cabinClass: CabinClass;
  row: number;
  column: string;
}
