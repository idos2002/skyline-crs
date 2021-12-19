/*
 * Initialization script for the Inventory PostgreSQL database.
 * Uses PostGIS for geographic location data.
 *
 * Supported for:
 *   - PostgreSQL version 14 and above.
 *   - PostGIS version 3.1 and above.
 */

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


/*
 * Create tables
 */

CREATE TABLE airport (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    iata_code text NOT NULL,
    -- Check if it is a valid airport iata code, e.g. TLV, LAX, etc.
    CHECK (iata_code ~ '\A[A-Z]{3}\Z'),
    icao_code text NOT NULL,
    -- Check if it is a valid airport icao code, e.g. LLBG, KLAX, etc.
    CHECK (icao_code ~ '\A[A-Z]{4}\Z'),
    airport_name text NOT NULL,
    subdivision_code text NOT NULL,
    -- Check if it is a valid ISO 3166-2 subdivision code, e.g. IL-M, US-CA, etc.
    CHECK (subdivision_code ~ '\A[A-Z]{2}-[A-Z0-9]{1,3}\Z'),
    city text NOT NULL,
    geo_location geography(point) NOT NULL,
    UNIQUE (iata_code, icao_code)
);

CREATE TABLE service (
    service_number integer PRIMARY KEY,
    origin_airport_id integer NOT NULL REFERENCES airport (id),
    destination_airport_id integer NOT NULL REFERENCES airport (id),
    UNIQUE (origin_airport_id, destination_airport_id)
);

CREATE TABLE aircraft_model (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    icao_code text NOT NULL,
    -- Check if it is a valid aircraft icao code, e.g. A5, B487, etc.
    CHECK (icao_code ~ '\A[A-Z0-9]{2,4}\Z'),
    iata_code text NOT NULL,
    -- Check if it is a valid aircraft iata code, e.g. A4F, 313, etc.
    CHECK (iata_code ~ '\A[A-Z0-9]{3}\Z'),
    model_name text NOT NULL,
    UNIQUE (icao_code, iata_code)
);

CREATE TABLE flight (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
    service_id integer NOT NULL REFERENCES service (service_number),
    departure_terminal text NOT NULL,
    departure_time timestamptz NOT NULL,
    arrival_terminal text NOT NULL,
    arrival_time timestamptz NOT NULL,
    CHECK (departure_time < arrival_time),
    aircraft_model_id integer NOT NULL REFERENCES aircraft_model (id)
);

CREATE TYPE cabin_class AS ENUM ('E', 'B', 'F');

CREATE TABLE booked_seat (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
    flight_id uuid NOT NULL REFERENCES flight (id),
    cabin_class cabin_class NOT NULL,
    seat_row integer NOT NULL CHECK (seat_row > 0),
    seat_column text NOT NULL,
    -- Check if the seat's column is a single uppercase letter (A-Z).
    CHECK (seat_column ~ '\A[A-Z]\Z'),
    UNIQUE (flight_id, seat_row, seat_column)
);

CREATE TABLE seat_map (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    aircraft_model_id integer REFERENCES aircraft_model (id),
    cabin_class cabin_class NOT NULL,
    start_row integer NOT NULL CHECK (start_row > 0),
    end_row integer NOT NULL CHECK (end_row > 0),
    CHECK (start_row <= end_row),
    column_layout text NOT NULL,
    -- Check if column layout is in the correct form, e.g. ABC-EF-GHI, ABC, ABC-DEF, etc.)
    CHECK (column_layout ~ '\A[A-Z]+(?:-[A-Z]+)*\Z'),
    UNIQUE (aircraft_model_id, start_row, end_row)
);


/*
 * Create functions
 */

CREATE FUNCTION column_layout_seats_count(column_layout text) RETURNS integer
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT
RETURN char_length(replace(column_layout, '-', ''));


/*
 * Create views
 */

CREATE VIEW cabin_seats_count AS
    SELECT aircraft_model_id,
           cabin_class,
           sum((end_row - start_row + 1) * column_layout_seats_count(column_layout)) AS seat_count
    FROM seat_map
    GROUP BY aircraft_model_id, cabin_class;

CREATE VIEW available_flight_seats_count AS
    WITH booked_seats_count AS (
        SELECT flight.id AS flight_id,
               flight.aircraft_model_id AS aircraft_model_id,
               booked_seat.cabin_class AS cabin_class,
               count(*) AS seat_count
        FROM flight
             INNER JOIN booked_seat
             ON flight.id = booked_seat.flight_id
        GROUP BY flight.id, booked_seat.cabin_class
    )
    SELECT booked_seats_count.flight_id AS flight_id,
           booked_seats_count.cabin_class AS cabin_class,
           cabin_seats_count.seat_count - booked_seats_count.seat_count AS available_seats_count,
           cabin_seats_count.seat_count AS total_seats_count
    FROM booked_seats_count
         INNER JOIN cabin_seats_count 
         ON booked_seats_count.aircraft_model_id = cabin_seats_count.aircraft_model_id;
