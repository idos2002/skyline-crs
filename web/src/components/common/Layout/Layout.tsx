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
