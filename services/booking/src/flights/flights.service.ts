import { ClientError, gql, GraphQLClient } from 'graphql-request';
import config from '@config';
import Seat from './interfaces/seat.interface';
import FlightNotFoundException from './flight-not-found.exception';
import Flight from './entities/flight.entity';
import { transformAndValidate } from 'class-transformer-validator';
import FlightRequestException from './flight-request.exception';
import FlightUnavailableException from './flight-unavailable.exception';
import BookedSeat from './entities/booked-seat.entity';

export default class FlightsService {
  private readonly graphqlClient: GraphQLClient;

  constructor() {
    this.graphqlClient = new GraphQLClient(config().inventoryManagerUrl);
  }

  async bookSeats(flightId: string, seats: Seat[]): Promise<BookedSeat[]> {
    const flight = await this.findFlight(flightId);

    // Check if any of the requested seats are already booked
    for (const bookedSeat of flight.bookedSeats) {
      const seatAlreadyBooked = seats.some(
        (seat) =>
          seat.row === bookedSeat.row && seat.column === bookedSeat.column,
      );
      if (seatAlreadyBooked) {
        throw new FlightUnavailableException(
          `The seat ${bookedSeat.row}${bookedSeat.column} on flight with ID ${flightId} is already booked`,
        );
      }
    }

    return await this.insertBookedSeats(flightId, seats);
  }

  private async findFlight(id: string): Promise<Flight> {
    const findFlightQuery = gql`
      query findFlight($flight_id: uuid!) {
        flight_by_pk(id: $flight_id) {
          id
          aircraft_model {
            seat_maps {
              cabin_class
              start_row
              end_row
              column_layout
            }
          }
          booked_seats {
            seat_row
            seat_column
          }
          available_seats_counts {
            cabin_class
            available_seats_count
            total_seats_count
          }
        }
      }
    `;

    try {
      const flightPlain = await this.graphqlClient.request(findFlightQuery, {
        flight_id: id,
      });

      if (!flightPlain.flight_by_pk) {
        throw new FlightNotFoundException(
          `Could not find flight with ID ${id}`,
        );
      }

      const flight = await transformAndValidate(
        Flight,
        flightPlain.flight_by_pk,
        { transformer: { excludeExtraneousValues: true } },
      );

      return flight as Flight;
    } catch (err) {
      if (err instanceof ClientError) {
        throw new FlightRequestException(
          'Error querying inventory manager with findFlight query',
          err,
        );
      }
      throw new FlightRequestException(
        `Flight object validation error:\n${JSON.stringify(err, null, 2)}`,
      );
    }
  }

  private async insertBookedSeats(
    flightId: string,
    seats: Seat[],
  ): Promise<BookedSeat[]> {
    const bookSeatsMutation = gql`
      mutation bookSeats($seats: [booked_seat_insert_input!]!) {
        insert_booked_seat(objects: $seats) {
          returning {
            id
            cabin_class
            seat_row
            seat_column
          }
        }
      }
    `;
    const seatsMutationVariable = seats.map((seat) => ({
      flight_id: flightId,
      cabin_class: seat.cabinClass,
      seat_row: seat.row,
      seat_column: seat.column,
    }));

    try {
      const bookedSeatsPlain = await this.graphqlClient.request(
        bookSeatsMutation,
        { seats: seatsMutationVariable },
      );

      if (!bookedSeatsPlain.insert_booked_seat.returning) {
        throw new FlightNotFoundException(
          `Could not find flight with ID ${flightId}`,
        );
      }

      const bookedSeats = await transformAndValidate(
        BookedSeat,
        bookedSeatsPlain.insert_booked_seat.returning,
        { transformer: { excludeExtraneousValues: true } },
      );

      return bookedSeats as BookedSeat[];
    } catch (err) {
      if (err instanceof ClientError) {
        throw new FlightUnavailableException(
          `The requested seats on flight with ID ${flightId} are already booked`,
        );
      }
      throw new FlightRequestException(
        `Flight object validation error:\n${JSON.stringify(err, null, 2)}`,
      );
    }
  }

  async cancelBookedSeats(flightId: string) {
    // TODO: Implement cancelBookedSeats
  }
}
