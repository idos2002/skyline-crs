import { AppShell } from '@mantine/core';
import { ReactNode } from 'react';
import HorizontalNavbar from '../HorizontalNavbar';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AppShell
      padding={0}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
      fixed
      header={
        <HorizontalNavbar
          links={[
            { link: '/', label: 'Find Flights' },
            { link: '/find-booking', label: 'Manage Booking' },
            { link: '/find-flight', label: 'Flight Info' },
            { link: '/about', label: 'About' },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
}
