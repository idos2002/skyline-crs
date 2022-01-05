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
 * Define enum tables
 */

CREATE TABLE cabin_class (
    value text PRIMARY KEY,
    description text NOT NULL
);
INSERT INTO cabin_class VALUES
    ('E', 'Economy class'),
    ('B', 'Business class'),
    ('F', 'First class');


/*
 * Define functions
 */

CREATE FUNCTION column_layout_seats_count(column_layout text) RETURNS integer
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT
RETURN char_length(translate(column_layout, '-#', ''));


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
    name text NOT NULL,
    subdivision_code text NOT NULL,
    -- Check if it is a valid ISO 3166-2 subdivision code, e.g. IL-M, US-CA, etc.
    CHECK (subdivision_code ~ '\A[A-Z]{2}-[A-Z0-9]{1,3}\Z'),
    city text NOT NULL,
    geo_location geography(point) NOT NULL,
    UNIQUE (iata_code, icao_code)
);

CREATE TABLE service (
    id integer PRIMARY KEY,
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
    name text NOT NULL,
    UNIQUE (icao_code, iata_code)
);

CREATE TABLE seat_map (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    aircraft_model_id integer REFERENCES aircraft_model (id),
    cabin_class text REFERENCES cabin_class (value) NOT NULL,
    start_row integer NOT NULL CHECK (start_row > 0),
    end_row integer NOT NULL CHECK (end_row > 0),
    CHECK (start_row <= end_row),
    column_layout text NOT NULL,
    -- Check if column layout is in the correct form, e.g. ABC-EF-GHI, ABC, ABC-DEF, etc.)
    CHECK (column_layout ~ '\A[A-Z#]+(?:-[A-Z#]+)*\Z'),
    UNIQUE (aircraft_model_id, start_row, end_row)
);

CREATE TABLE flight (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
    service_id integer NOT NULL REFERENCES service (id),
    departure_terminal text NOT NULL,
    departure_time timestamptz NOT NULL,
    arrival_terminal text NOT NULL,
    arrival_time timestamptz NOT NULL,
    CHECK (departure_time < arrival_time),
    aircraft_model_id integer NOT NULL REFERENCES aircraft_model (id)
);

CREATE TABLE booked_seat (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
    flight_id uuid NOT NULL REFERENCES flight (id),
    cabin_class text REFERENCES cabin_class (value) NOT NULL,
    seat_row integer NOT NULL CHECK (seat_row > 0),
    seat_column text NOT NULL,
    -- Check if the seat's column is a single uppercase letter (A-Z).
    CHECK (seat_column ~ '\A[A-Z]\Z'),
    UNIQUE (flight_id, seat_row, seat_column)
);


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
    WITH flight_cabin_class AS (
        SELECT flight.id AS flight_id,
               flight.aircraft_model_id AS aircraft_model_id,
               cabin_class.value AS cabin_class
        FROM flight CROSS JOIN cabin_class
    ), booked_seats_count AS (
        SELECT flight.id AS flight_id,
               booked_seat.cabin_class AS cabin_class,
               count(*) AS booked_seats_count
        FROM flight INNER JOIN booked_seat ON flight.id = booked_seat.flight_id
        GROUP BY flight.id, booked_seat.cabin_class
    )
    SELECT flight_cabin_class.flight_id AS flight_id,
           flight_cabin_class.cabin_class AS cabin_class,
           cabin_seats_count.seat_count - coalesce(booked_seats_count.booked_seats_count, 0) AS available_seats_count,
           cabin_seats_count.seat_count AS total_seats_count
    FROM flight_cabin_class
         LEFT JOIN booked_seats_count
                   ON flight_cabin_class.flight_id = booked_seats_count.flight_id
                   AND flight_cabin_class.cabin_class = booked_seats_count.cabin_class
         LEFT JOIN cabin_seats_count
                   ON flight_cabin_class.aircraft_model_id = cabin_seats_count.aircraft_model_id
                   AND flight_cabin_class.cabin_class = cabin_seats_count.cabin_class
    WHERE cabin_seats_count.seat_count > 0;


/*
 * Insert dummy data
 */

INSERT INTO airport (iata_code, icao_code, name, subdivision_code, city, geo_location) VALUES
    ('TLV', 'LLBG', 'Ben Gurion Airport', 'IL-M', 'Tel Aviv-Yafo', 'SRID=4326;POINT(32.009444 34.882778)'), -- id: 1
    ('LAX', 'KLAX', 'Los Angeles International Airport', 'US-CA', 'Los Angeles', 'SRID=4326;POINT(33.9425 -118.408056)'); -- id: 2

INSERT INTO service (id, origin_airport_id, destination_airport_id) VALUES (1, 1, 2); -- From TLV to LAX

INSERT INTO aircraft_model (icao_code, iata_code, name) VALUES ('B789', '789', 'Boeing 787-9 Dreamliner'); -- id: 1

-- Boeing 787-9 Dreamliner seat map
INSERT INTO seat_map (aircraft_model_id, cabin_class, start_row, end_row, column_layout) VALUES
    (1, 'F', 1, 8, 'A-DG-K'),
    (1, 'B', 10, 14, 'AC-DFG-HK'),
    (1, 'E', 21, 28, 'ABC-DFG-HJK'),
    (1, 'E', 29, 30, '###-###-HJK'),
    (1, 'E', 35, 36, 'ABC-###-HJK'),
    (1, 'E', 37, 48, 'ABC-DFG-HJK'),
    (1, 'E', 49, 50, '###-DFG-###');

INSERT INTO flight (id, service_id, departure_terminal, departure_time, arrival_terminal, arrival_time, aircraft_model_id) VALUES
    ('eb2e5080-000e-440d-8242-46428e577ce5', 1, '3', '2020-01-01T01:05+02:00', 'B', '2020-01-01T06:00-08:00', 1);

INSERT INTO booked_seat (flight_id, cabin_class, seat_row, seat_column) VALUES
    ('eb2e5080-000e-440d-8242-46428e577ce5', 'E', 40, 'D'),
    ('eb2e5080-000e-440d-8242-46428e577ce5', 'E', 40, 'F'),
    ('eb2e5080-000e-440d-8242-46428e577ce5', 'E', 40, 'G');
