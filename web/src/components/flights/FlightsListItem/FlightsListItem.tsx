import { useState } from 'react';
import {
  Box,
  Button,
  Group,
  MediaQuery,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import dayjs from 'dayjs';
import Airport from '@lib/flights/types/airport.interface';
import Flight from '@lib/flights/types/flight.interface';
import CabinStatistics from '@lib/flights/types/cabin-statistics.interface';
import PlaneDivider from '../PlaneDivider';
import FlightCabinOption from '../FlightCabinOption';
import CabinClass from '@lib/common/types/cabin-class.enum';
import openFlights from '@lib/openflights';

export interface FlightsListItemProps {
  serviceName: string;
  origin: Airport;
  destination: Airport;
  flight: Flight;
  onSelect?: (flight: Flight, cabinClass: CabinClass) => void;
}

export default function FlightsListItem({
  serviceName,
  origin,
  destination,
  flight,
  onSelect,
}: FlightsListItemProps) {
  const [cabinClass, setCabinClass] = useState<CabinClass | null>(null);

  const departureTime = dayjs
    .utc(flight.departureTime)
    .tz(openFlights.findByIataCode(origin.iataCode)?.timezone ?? '');

  const arrivalTime = dayjs
    .utc(flight.arrivalTime)
    .tz(openFlights.findByIataCode(destination.iataCode)?.timezone ?? '');

  const isArrivalDayAfter = arrivalTime.date() !== departureTime.date();

  const flightDurationMinutes = Math.floor(
    dayjs
      .utc(flight.arrivalTime)
      .diff(dayjs.utc(flight.departureTime), 'minute'),
  );

  const cabinStatistics = getCabinStatisticsMap(flight);
  const getAvailableSeatsCount = (cabinClass: CabinClass) =>
    cabinStatistics.get(cabinClass)?.availableSeatsCount ?? 0;

  const onSelectCabinClass = (cabinClass: CabinClass) => {
    onSelect?.(flight, cabinClass);
    setCabinClass(cabinClass);
  };

  return (
    <Paper my={4} p="md" shadow="sm">
      <MediaQuery smallerThan="sm" styles={{ flexDirection: 'column' }}>
        <Group position="apart" align="stretch">
          <MediaQuery
            smallerThan="sm"
            styles={{ flexDirection: 'column', width: '100%' }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <MediaQuery smallerThan="sm" styles={{ flexDirection: 'column' }}>
                <Group>
                  <MediaQuery
                    smallerThan="sm"
                    styles={{ alignItems: 'center' }}
                  >
                    <Stack align="flex-start" spacing={0}>
                      <Text weight={700}>{departureTime.format('HH:mm')}</Text>
                      <Text weight={500}>{origin.location.city}</Text>
                      <Text>{origin.iataCode}</Text>
                    </Stack>
                  </MediaQuery>

                  <MediaQuery
                    smallerThan="sm"
                    styles={{ width: '100%', margin: 0 }}
                  >
                    <Stack
                      align="center"
                      justify="center"
                      spacing={4}
                      mx="sm"
                      sx={{ flexGrow: 1 }}
                    >
                      <Text weight={700} size="sm">
                        {Math.floor(flightDurationMinutes / 60)}h{' '}
                        {flightDurationMinutes % 60}m
                      </Text>
                      <PlaneDivider />
                      <Button compact variant="subtle" size="xs">
                        Flight Details
                      </Button>
                      {/* TODO: Add flight details modal! */}
                    </Stack>
                  </MediaQuery>

                  <MediaQuery
                    smallerThan="sm"
                    styles={{ alignItems: 'center' }}
                  >
                    <Stack align="flex-end" spacing={0}>
                      <Text weight={700}>
                        {arrivalTime.format('HH:mm')}
                        {isArrivalDayAfter && <sup>+1</sup>}
                      </Text>
                      <Text weight={500}>{destination.location.city}</Text>
                      <Text>{destination.iataCode}</Text>
                    </Stack>
                  </MediaQuery>
                </Group>
              </MediaQuery>

              <Text mt="xs" size="sm" color="dimmed">
                {serviceName} operated by Skyline Airlines
              </Text>
            </Box>
          </MediaQuery>

          {/* FIXME: Disable when not enough seats for passengers */}

          <Group
            spacing="sm"
            position="center"
            mx="sm"
            sx={{ alignItems: 'stretch' }}
          >
            <FlightCabinOption
              cabinClass={CabinClass.ECONOMY}
              active={cabinClass === CabinClass.ECONOMY}
              availableSeatsCount={getAvailableSeatsCount(CabinClass.ECONOMY)}
              onClick={onSelectCabinClass}
            />
            <FlightCabinOption
              cabinClass={CabinClass.BUSINESS}
              active={cabinClass === CabinClass.BUSINESS}
              availableSeatsCount={getAvailableSeatsCount(CabinClass.BUSINESS)}
              onClick={onSelectCabinClass}
            />
            <FlightCabinOption
              cabinClass={CabinClass.FIRST}
              active={cabinClass === CabinClass.FIRST}
              availableSeatsCount={getAvailableSeatsCount(CabinClass.FIRST)}
              onClick={onSelectCabinClass}
            />
          </Group>
        </Group>
      </MediaQuery>
    </Paper>
  );
}

function getCabinStatisticsMap(
  flight: Flight,
): Map<CabinClass, CabinStatistics> {
  const statistics = new Map<CabinClass, CabinStatistics>();
  for (const cabin of flight.cabins) {
    statistics.set(cabin.cabinClass, cabin);
  }
  return statistics;
}
