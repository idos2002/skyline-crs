import { gql, GraphQLClient } from 'graphql-request';
import parseISODateString from 'date-fns/parseISO';
import createLogger from '../log';
import Flight from './interfaces/flight.interface';
import Airport from './interfaces/airport.interface';
import GeoLocation from './interfaces/geo-location.interface';
import BookedSeat from './interfaces/booked-seat.interface';

export default class FlightsService {
  private readonly log = createLogger(__filename);

  private constructor(private readonly graphqlClient: GraphQLClient) {}

  public static async create(
    graphqlClient: GraphQLClient,
  ): Promise<FlightsService> {
    return new FlightsService(graphqlClient);
  }

  public async findFlight(id: string): Promise<Flight> {
    const findFlightQuery = gql`
      query findFlight($flight_id: uuid!) {
        flight_by_pk(id: $flight_id) {
          service {
            id
            destination_airport {
              ...airport_details
            }
            origin_airport {
              ...airport_details
            }
          }
          departure_time
          arrival_time
        }
      }

      fragment airport_details on airport {
        iata_code
        name
        subdivision_code
        city
        geo_location
      }
    `;

    let flight = await this.graphqlClient.request(findFlightQuery, {
      flight_id: id,
    });
    flight = flight.flight_by_pk;

    if (!flight) {
      throw new Error(`Could not find flight with ID ${id}`);
    }

    const originGeoLocationCrs =
      flight.service.origin_airport.geo_location.crs.properties.name;

    if (originGeoLocationCrs != 'urn:ogc:def:crs:EPSG::4326') {
      this.log.error(
        { flightId: id, crs: originGeoLocationCrs },
        'Flight origin airport geo location uses unsupported coordinate reference system (CRS), assuming urn:ogc:def:crs:EPSG::4326 instead',
      );
    }

    const destinationGeoLocationCrs =
      flight.service.destination_airport.geo_location.crs.properties.name;

    if (destinationGeoLocationCrs != 'urn:ogc:def:crs:EPSG::4326') {
      this.log.error(
        { flightId: id, crs: destinationGeoLocationCrs },
        'Flight destination airport geo location uses unsupported coordinate reference system (CRS), assuming urn:ogc:def:crs:EPSG::4326 instead',
      );
    }

    return {
      serviceId: flight.service.id,
      origin: this.parseAirport(flight.service.origin_airport),
      destination: this.parseAirport(flight.service.destination_airport),
      departureTime: parseISODateString(flight.departure_time),
      arrivalTime: parseISODateString(flight.arrival_time),
    };
  }

  private parseAirport(airport: any): Airport {
    return {
      iataCode: airport.iata_code,
      name: airport.name,
      subdivisionCode: airport.subdivision_code,
      city: airport.city,
      geoLocation: this.parseGeoLocation(airport.geo_location),
    };
  }

  private parseGeoLocation(geoLocation: any): GeoLocation {
    return {
      latitude: geoLocation.coordinates[0],
      longitude: geoLocation.coordinates[1],
    };
  }

  /**
   * Finds the booked seats for the given booked seat IDs.
   *
   * **Note:**
   * The returned array is not ordered in the same order of IDs in the input array!
   *
   * @param bookedSeatIds IDs of the booked seats to find.
   * @returns Unordered array of booked seats objects.
   */
  public async findBookedSeats(bookedSeatIds: string[]): Promise<BookedSeat[]> {
    const findBookedSeatsQuery = gql`
      query findBookedSeats($booked_seat_ids: [uuid!]!) {
        booked_seat(where: { id: { _in: $booked_seat_ids } }) {
          id
          cabin_class
          seat_row
          seat_column
        }
      }
    `;

    let bookedSeats = await this.graphqlClient.request(findBookedSeatsQuery, {
      booked_seat_ids: bookedSeatIds,
    });
    bookedSeats = bookedSeats.booked_seat;

    return bookedSeats.map((s: Record<string, any>) => ({
      id: s.id,
      cabinClass: s.cabin_class,
      row: s.seat_row,
      column: s.seat_column,
    }));
  }
}
