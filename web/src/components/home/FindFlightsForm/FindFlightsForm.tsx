import { useRouter } from 'next/router';
import {
  Button,
  Grid,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { DatePicker } from '@mantine/dates';
import { ChevronRight } from 'tabler-icons-react';
import { z } from 'zod';
import dayjs from 'dayjs';
import AirportSelect from '@components/common/AirportSelect';
import CabinClass from '@lib/types/cabin-class.enum';

export interface FindFLightsFormProps {
  airports: { iataCode: string; city: string; country: string }[];
}

const formSchema = z.object({
  tripType: z.enum(['return', 'one-way']),
  origin: z
    .string({
      required_error: 'Origin airport is required',
      invalid_type_error: 'Invalid airport',
    })
    .regex(/^[A-Z]{3}$/, { message: 'Invalid airport' }),
  destination: z
    .string({
      required_error: 'Destination airport is required',
      invalid_type_error: 'Invalid airport',
    })
    .regex(/^[A-Z]{3}$/, { message: 'Invalid airport' }),
  departureDate: z
    .date({
      required_error: 'Departure date is required',
      invalid_type_error: 'Invalid date',
    })
    .refine((value) => dayjs(value).isSameOrAfter(new Date(), 'days'), {
      message: 'Invalid departure date',
    }),
  returnDate: z
    .date({
      invalid_type_error: 'Invalid date',
    })
    .optional()
    .refine((value) => dayjs(value).isSameOrAfter(new Date(), 'days'), {
      message: 'Invalid return date',
    }),
  passengers: z
    .number({
      required_error: 'Number of passengers is required',
      invalid_type_error: 'Invalid number',
    })
    .int({ message: 'Invalid number of passengers' })
    .positive({ message: 'Invalid number of passengers' }),
  cabinClass: z.nativeEnum(CabinClass, {
    required_error: 'Cabin class is required',
    invalid_type_error: 'Invalid cabin class',
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function FindFlightsForm({ airports }: FindFLightsFormProps) {
  const form = useForm<FormSchema>({
    schema: zodResolver(formSchema),
    initialValues: {
      tripType: 'return',
      origin: '',
      destination: '',
      departureDate: new Date(),
      passengers: 1,
      cabinClass: CabinClass.ECONOMY,
    },
  });

  const router = useRouter();

  const isReturnTrip = form.values.tripType === 'return';

  const onSubmitForm = form.onSubmit(
    ({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
    }) => {
      if (isReturnTrip) {
        if (returnDate === undefined) {
          form.setFieldError('returnDate', 'Return date is required');
          return;
        }

        if (!dayjs(returnDate).isSameOrAfter(departureDate)) {
          form.setFieldError('returnDate', 'Invalid return date');
          return;
        }
      }

      router.push({
        pathname: '/flights/[origin]/[destination]',
        query: {
          origin,
          destination,
          passengers,
          cabin: cabinClass,
          depart: dayjs(departureDate).format('YYYY-MM-DD'),
          ...(isReturnTrip && {
            return: dayjs(returnDate).format('YYYY-MM-DD'),
          }),
        },
      });
    },
  );

  return (
    <form onSubmit={onSubmitForm}>
      <Stack>
        <RadioGroup {...form.getInputProps('tripType')}>
          <Radio value="return" label="Return trip"></Radio>
          <Radio value="one-way" label="One way"></Radio>
        </RadioGroup>

        <Grid align="stretch">
          <Grid.Col sm={4}>
            <AirportSelect
              label="From"
              data={airports}
              {...form.getInputProps('origin')}
            />
          </Grid.Col>

          <Grid.Col sm={4}>
            <AirportSelect
              label="To"
              data={airports}
              {...form.getInputProps('destination')}
            />
          </Grid.Col>

          <Grid.Col span={isReturnTrip ? 6 : 12} sm={isReturnTrip ? 2 : 4}>
            <DatePicker
              label="Depart"
              minDate={new Date()}
              {...form.getInputProps('departureDate')}
            />
          </Grid.Col>

          {isReturnTrip && (
            <Grid.Col span={6} sm={2}>
              <DatePicker
                label="Return"
                minDate={form.values.departureDate}
                {...form.getInputProps('returnDate')}
              />
            </Grid.Col>
          )}

          <Grid.Col sm={3}>
            <NumberInput
              label="Passengers"
              defaultValue={1}
              min={1}
              {...form.getInputProps('passengers')}
            />
          </Grid.Col>

          <Grid.Col sm={3}>
            <Select
              label="Cabin Class"
              data={[
                { value: CabinClass.ECONOMY, label: 'Economy' },
                { value: CabinClass.BUSINESS, label: 'Business' },
                { value: CabinClass.FIRST, label: 'First class' },
              ]}
              {...form.getInputProps('cabinClass')}
            />
          </Grid.Col>

          <Grid.Col
            sm={6}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'end',
              [theme.fn.smallerThan('sm')]: {
                justifyContent: 'center',
              },
            })}
          >
            <Button type="submit" size="lg" rightIcon={<ChevronRight />}>
              Search Flights
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  );
}
