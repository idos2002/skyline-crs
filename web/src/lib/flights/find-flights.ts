import CabinClass from '@lib/common/types/cabin-class.enum';
import axios from 'axios';
import axiosClient from './axios-client';
import Airport from './types/airport.interface';
import Flight from './types/flight.interface';

export interface FindFlightsRequest {
  origin: string;
  destination: string;
  departureTime: Date;
  passengers?: number | undefined;
  cabinClass?: CabinClass | undefined;
}

export interface FindFlightsResponse {
  name: string;
  origin: Airport;
  destination: Airport;
  flights: Flight[];
}

export default async function findFlights({
  origin,
  destination,
  departureTime,
  passengers,
  cabinClass,
}: FindFlightsRequest): Promise<FindFlightsResponse | null> {
  const departureDateStr = departureTime.toISOString();

  try {
    const response = await axiosClient.get(
      `/flights/${origin}/${destination}/${departureDateStr}`,
      { params: { passengers, cabin: cabinClass } },
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      if (err.response.status < 500) {
        return null;
      }
    }
    throw err;
  }
}
