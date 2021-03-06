import { ClientError, gql, GraphQLClient } from 'graphql-request';
import { transformAndValidate } from 'class-transformer-validator';
import Seat from './interfaces/seat.interface';
import Flight from './entities/flight.entity';
import BookedSeat from './entities/booked-seat.entity';
import FlightNotFoundException from './exceptions/flight-not-found.exception';
import FlightRequestException from './exceptions/flight-request.exception';
import FlightUnavailableException from './exceptions/flight-unavailable.exception';
import FlightSeatNotFoundException from './exceptions/flight-seat-not-found.exception';

export default class FlightsService {
  private constructor(private readonly graphqlClient: GraphQLClient) {}

  public static async create(
    graphqlClient: GraphQLClient,
  ): Promise<FlightsService> {
    return new FlightsService(graphqlClient);
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
        throw new FlightUnavailableException();
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
      let flightPlain = await this.graphqlClient.request(findFlightQuery, {
        flight_id: id,
      });

      flightPlain = flightPlain.flight_by_pk;

      if (!flightPlain) {
        throw new FlightNotFoundException();
      }

      const flight = await transformAndValidate(Flight, flightPlain, {
        transformer: { excludeExtraneousValues: true },
      });

      return flight as Flight;
    } catch (err) {
      if (err instanceof FlightNotFoundException) throw err;
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
      let bookedSeatsPlain = await this.graphqlClient.request(
        bookSeatsMutation,
        { seats: seatsMutationVariable },
      );

      bookedSeatsPlain = bookedSeatsPlain.insert_booked_seat.returning;

      if (
        !bookedSeatsPlain ||
        (Array.isArray(bookedSeatsPlain) && bookedSeatsPlain.length === 0)
      ) {
        throw new FlightNotFoundException();
      }

      const bookedSeats = await transformAndValidate(
        BookedSeat,
        bookedSeatsPlain,
        { transformer: { excludeExtraneousValues: true } },
      );

      return bookedSeats as BookedSeat[];
    } catch (err) {
      if (err instanceof FlightNotFoundException) throw err;
      if (err instanceof ClientError) {
        throw new FlightUnavailableException();
      }
      throw new FlightRequestException(
        `Flight object validation error:\n${JSON.stringify(err, null, 2)}`,
      );
    }
  }

  async cancelBookedSeats(seatIds: string[]): Promise<BookedSeat[]> {
    const removeBookedSeatsMutation = gql`
      mutation removeBookedSeats($seats: [uuid!]!) {
        delete_booked_seat(where: { id: { _in: $seats } }) {
          returning {
            id
            cabin_class
            seat_row
            seat_column
          }
        }
      }
    `;

    try {
      let removedSeatsPlain = await this.graphqlClient.request(
        removeBookedSeatsMutation,
        { seats: seatIds },
      );

      removedSeatsPlain = removedSeatsPlain.delete_booked_seat.returning;

      if (
        !removedSeatsPlain ||
        (Array.isArray(removedSeatsPlain) && removedSeatsPlain.length === 0)
      ) {
        const seatIdsString = seatIds.join(', ');
        throw new FlightSeatNotFoundException(
          `Could not find booked seats with IDs: ${seatIdsString}`,
        );
      }

      const removedSeats = await transformAndValidate(
        BookedSeat,
        removedSeatsPlain,
        { transformer: { excludeExtraneousValues: true } },
      );

      return removedSeats as BookedSeat[];
    } catch (err) {
      if (err instanceof FlightSeatNotFoundException) throw err;
      if (err instanceof ClientError) {
        const seatIdsString = seatIds.join(', ');
        throw new FlightRequestException(
          `Error requesting to cancel booked seats: ${seatIdsString}`,
          err,
        );
      }
      throw new FlightRequestException(
        `Flight object validation error:\n${JSON.stringify(err, null, 2)}`,
      );
    }
  }
}
