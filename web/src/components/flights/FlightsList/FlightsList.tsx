import { Center, Group, Paper, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { PlaneOff } from 'tabler-icons-react';
import Airport from '@lib/flights/types/airport.interface';
import Flight from '@lib/flights/types/flight.interface';
import openFlights from '@lib/openflights';
import FlightsListItem from '../FlightsListItem';
import CabinClass from '@lib/common/types/cabin-class.enum';

export interface FlightsListProps {
  serviceName: string;
  origin: Airport;
  destination: Airport;
  departureDate: Date;
  flights: Flight[];
  onSelect?: (flight: Flight, cabinClass: CabinClass) => void;
}

export default function FlightsList({
  serviceName,
  origin,
  destination,
  departureDate,
  flights,
  onSelect,
}: FlightsListProps) {
  const dateTitle = (
    <Paper mt="md" p="md" shadow="sm">
      <Title order={4}>
        {dayjs
          .utc(departureDate)
          .utcOffset(
            openFlights.findByIataCode(origin.iataCode)?.timezoneOffset ?? 0,
          )
          .format('dddd, MMMM D, YYYY')}
      </Title>
    </Paper>
  );

  if (flights.length === 0) {
    return (
      <>
        {dateTitle}

        <Paper my={4} p="md" shadow="sm">
          <Center>
            <Group>
              <PlaneOff />
              <Text weight={500}>No flights were found</Text>
            </Group>
          </Center>
        </Paper>
      </>
    );
  }

  return (
    <>
      {dateTitle}

      {flights.map((flight) => (
        <FlightsListItem
          key={flight.id}
          serviceName={serviceName}
          origin={origin}
          destination={destination}
          flight={flight}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
