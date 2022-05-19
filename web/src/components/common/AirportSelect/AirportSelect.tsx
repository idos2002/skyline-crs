import { Select, SelectProps } from '@mantine/core';
import AirportSelectItem from '../AirportSelectItem';

export interface AirportSelectProps extends Omit<SelectProps, 'data'> {
  data: {
    iataCode: string;
    city: string;
    country: string;
  }[];
}

type DataItem = AirportSelectProps['data'][number];

type NormalizedDataItem = DataItem & {
  value: string;
  label: string;
};

export default function AirportSelect({ data, ...props }: AirportSelectProps) {
  return (
    <Select
      placeholder="Country, city or airport"
      itemComponent={AirportSelectItem}
      searchable
      nothingFound="Nothing found"
      data={normalizeData(data)}
      filter={filterItems}
      limit={20}
      {...props}
    />
  );
}

function normalizeData(data: DataItem[]): NormalizedDataItem[] {
  return data.map((airport) => ({
    ...airport,
    value: airport.iataCode,
    label: `${airport.city} (${airport.iataCode})`,
  }));
}

function filterItems(value: string, item: NormalizedDataItem) {
  return (
    compareToInput(item.iataCode ?? '', value) ||
    compareToInput(item.city, value) ||
    compareToInput(item.country, value) ||
    compareToInput(item.label, value)
  );
}

function compareToInput(value: string, inputValue: string): boolean {
  return value.toLowerCase().includes(inputValue.trim().toLowerCase());
}
