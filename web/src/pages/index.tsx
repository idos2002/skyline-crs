import { Center, Paper, Title } from '@mantine/core';
import Head from 'next/head';
import FindFlightsForm from '@components/home/FindFlightsForm';
import { GetServerSideProps } from 'next';
import { pickAirportDetailsCompact } from '@lib/openflights';

interface HomeProps {
  airports: {
    iataCode: string;
    city: string;
    country: string;
  }[];
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => ({
  props: {
    airports: pickAirportDetailsCompact('iataCode', 'city', 'country'),
  },
});

export default function Home({ airports }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Skyline</title>
      </Head>

      <Center
        p="xl"
        sx={{
          backgroundImage: 'url(sky-background.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <Paper p="xl">
          <Title order={1} mb="md">
            Find Your Dream Flight
          </Title>

          <FindFlightsForm airports={airports} />
        </Paper>
      </Center>
    </>
  );
}
