import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { z } from 'zod';
import dayjs from 'dayjs';
import Head from 'next/head';
import { Button, Center, Container, Group, Title } from '@mantine/core';
import { PlaneDeparture, PlaneArrival, Plane } from 'tabler-icons-react';
import pick from '@lib/common/util/pick';
import unwrapArray from '@lib/common/util/unwrap-array';
import CabinClass from '@lib/common/types/cabin-class.enum';
import openFlights from '@lib/openflights';
import { findFlights, FindFlightsResponse } from '@lib/flights';
import FlightsList from '@components/flights/FlightsList';
import Flight from '@lib/flights/types/flight.interface';

function unwrapQueryParam(param: unknown): string | null {
  if (typeof param === 'string' && param) return param;
  if (Array.isArray(param)) return unwrapArray(param);
  return null;
}

const isValidDate = (d: string) => dayjs(d).isValid();

const iataAirportCodeSchema = z
  .preprocess(unwrapQueryParam, z.string().regex(/^[A-Za-z]{3}$/))
  .transform((s) => s.toUpperCase());

const flightsSearchQuerySchema = z.object({
  origin: iataAirportCodeSchema,
  destination: iataAirportCodeSchema,
  depart: z.preprocess(unwrapQueryParam, z.string()).refine(isValidDate),
  return: z
    .preprocess(
      (arg) => unwrapQueryParam(arg) || undefined,
      z.string().optional(),
    )
    .refine((d) => !d || isValidDate(d)),
  passengers: z.preprocess((arg) => {
    const unwrapped = unwrapQueryParam(arg);
    return unwrapped && parseInt(unwrapped);
  }, z.number().int().positive()),
  cabin: z.preprocess((arg) => {
    const unwrapped = unwrapQueryParam(arg);
    return unwrapped && unwrapped.toUpperCase();
  }, z.nativeEnum(CabinClass)),
});

type FlightsSearchQuery = z.infer<typeof flightsSearchQuerySchema>;

interface FlightsSearchProps {
  originIataCode: string;
  destinationIataCode: string;
  departureDate: string;
  returnDate: string | null;
  departureFlights: FindFlightsResponse | null;
  returnFlights: FindFlightsResponse | null;
  passengers: number;
}

function parseFlightsSearchQuery({
  params,
  ...query
}: ParsedUrlQuery): FlightsSearchQuery | null {
  if (!Array.isArray(params) || params.length !== 2) return null;
  const [origin, destination] = params;

  const pickedQuery = pick(query, ['passengers', 'cabin', 'depart', 'return']);

  const parsedQuery = flightsSearchQuerySchema.safeParse({
    origin,
    destination,
    ...pickedQuery,
  });

  return parsedQuery.success ? parsedQuery.data : null;
}

export const getServerSideProps: GetServerSideProps<
  FlightsSearchProps
> = async (context) => {
  const parsedQuery = parseFlightsSearchQuery(context.query);
  if (parsedQuery === null) return { notFound: true };

  const departureTime = dayjs.tz(
    parsedQuery.depart,
    openFlights.findByIataCode(parsedQuery.origin)?.timezone ?? '',
  );

  const returnTime = parsedQuery.return
    ? dayjs.tz(
        parsedQuery.return,
        openFlights.findByIataCode(parsedQuery.destination)?.timezone ?? '',
      )
    : null;

  const findReturnFlights = async () =>
    returnTime &&
    (await findFlights({
      ...parsedQuery,
      departureTime: returnTime.toDate(),
      origin: parsedQuery.destination,
      destination: parsedQuery.origin,
    }));

  const [departureFlights, returnFlights] = await Promise.all([
    findFlights({
      ...parsedQuery,
      departureTime: departureTime.toDate(),
    }),
    findReturnFlights(),
  ]);

  if (departureFlights === null && returnFlights === null) {
    return { notFound: true };
  }

  return {
    props: {
      originIataCode: parsedQuery.origin,
      destinationIataCode: parsedQuery.destination,
      departureDate: departureTime.format(),
      returnDate: returnTime?.format() ?? null,
      departureFlights,
      returnFlights,
      passengers: parsedQuery.passengers,
    },
  };
};

export default function FlightsSearch({
  originIataCode,
  destinationIataCode,
  departureDate,
  returnDate,
  departureFlights,
  returnFlights,
  passengers,
}: FlightsSearchProps) {
  const router = useRouter();

  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<{
    flight: Flight;
    cabinClass: CabinClass;
  } | null>(null);

  const [selectedReturnFlight, setSelectedReturnFLight] = useState<{
    flight: Flight;
    cabinClass: CabinClass;
  } | null>(null);

  const onBookFlight = () => {
    const departureFlightId = selectedDepartureFlight?.flight.id;
    const departureCabinClass = selectedDepartureFlight?.cabinClass;
    let url = `/book?passengers=${passengers}&departure=${departureFlightId}&departCabin=${departureCabinClass}`;

    if (selectedReturnFlight !== null) {
      const returnFlightId = selectedReturnFlight.flight.id;
      const returnCabinClass = selectedReturnFlight.cabinClass;
      url += `&return=${returnFlightId}&returnCabin=${returnCabinClass}`;
    }

    router.push(url);
  };

  const originCity =
    openFlights.findByIataCode(originIataCode)?.city ?? 'Unknown City';
  const destinationCity =
    openFlights.findByIataCode(destinationIataCode)?.city ?? 'Unknown City';

  return (
    <>
      <Head>
        <title>
          Flights from {originIataCode} to {destinationIataCode} | Skyline
        </title>
      </Head>

      <Container size="xl" px="xl">
        <Group mt="md">
          <PlaneDeparture />
          <Title order={3}>Departure</Title>
        </Group>

        <Title order={1}>
          <b>{originCity}</b> to <b>{destinationCity}</b>
        </Title>

        {departureFlights ? (
          <FlightsList
            serviceName={departureFlights.name}
            origin={departureFlights.origin}
            destination={departureFlights.destination}
            departureDate={new Date(departureDate)}
            flights={departureFlights.flights}
            onSelect={(flight, cabinClass) =>
              setSelectedDepartureFlight({ flight, cabinClass })
            }
          />
        ) : (
          <Title order={4} p="md" align="center">
            There is no airline service from {originCity} to {destinationCity}
          </Title>
        )}

        {!!returnDate && (
          <>
            <Group mt="xl">
              <PlaneArrival />
              <Title order={3}>Return</Title>
            </Group>

            <Title order={1}>
              <b>{destinationCity}</b> to <b>{originCity}</b>
            </Title>

            {returnFlights ? (
              <FlightsList
                serviceName={returnFlights.name}
                origin={returnFlights.origin}
                destination={returnFlights.destination}
                departureDate={new Date(returnDate)}
                flights={returnFlights.flights}
                onSelect={(flight, cabinClass) =>
                  setSelectedReturnFLight({ flight, cabinClass })
                }
              />
            ) : (
              <Title order={4} p="md" align="center">
                There is no airline service from {destinationCity} to{' '}
                {originCity}
              </Title>
            )}
          </>
        )}

        <Center m="xl" py="md">
          <Button
            onClick={onBookFlight}
            disabled={selectedDepartureFlight === null}
            size="lg"
            rightIcon={<Plane />}
            sx={(theme) => ({
              boxShadow: theme.shadows.sm,
              transition: 'box-shadow 200ms',
              transitionTimingFunction: 'ease-in',
              ':hover:enabled': { boxShadow: theme.shadows.lg },
            })}
          >
            Book {departureFlights && returnFlights ? 'Flights' : 'Flight'}
          </Button>
        </Center>
      </Container>
    </>
  );
}
