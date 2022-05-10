import { Center, Paper, Title } from '@mantine/core';
import Head from 'next/head';
import FindFlightsForm from '@components/home/FindFlightsForm';

export default function Home() {
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

          <FindFlightsForm
            airports={[
              { iataCode: 'TLV', city: 'Tel Aviv-Yafo', country: 'Israel' },
              {
                iataCode: 'LAX',
                city: 'Los Angeles',
                country: 'USA',
              },
            ]}
          />
        </Paper>
      </Center>
    </>
  );
}
