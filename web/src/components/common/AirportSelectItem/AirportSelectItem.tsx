import { Group, SelectItemProps, Text } from '@mantine/core';
import { forwardRef } from 'react';

export interface AirportSelectItemProps extends SelectItemProps {
  iataCode: string;
  city: string;
  country: string;
}

const AirportSelectItem = forwardRef<HTMLDivElement, AirportSelectItemProps>(
  ({ iataCode, city, country, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Text size="lg">{iataCode}</Text>

        <div>
          <Text size="md">{city}</Text>
          <Text size="xs" color="dimmed">
            {country}
          </Text>
        </div>
      </Group>
    </div>
  ),
);

AirportSelectItem.displayName = 'AirportSelectItem';

export default AirportSelectItem;
