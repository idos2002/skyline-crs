import { createStyles, Text } from '@mantine/core';
import CabinClass from '@lib/common/types/cabin-class.enum';

const useStyles = createStyles((theme) => ({
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    gap: theme.spacing.md,

    backgroundColor: 'transparent',
    border: `2px solid ${theme.colors.gray[2]}`,
    borderRadius: theme.radius.md,

    cursor: 'pointer',

    transition: 'box-shadow 200ms, background-color 200ms',
    animationTimingFunction: 'ease-in',

    ':hover': {
      boxShadow: `0 0 12px #00000018`,
    },
  },

  active: {
    backgroundColor: theme.colors.gray[0],
    boxShadow: `0 0 12px #00000018`,
  },
}));

export interface FlightCabinOptionProps {
  cabinClass: CabinClass;
  availableSeatsCount: number;
  active?: boolean | undefined;
  onClick?: (cabinClass: CabinClass) => void;
}

export default function FlightCabinOption({
  cabinClass,
  availableSeatsCount,
  active,
  onClick,
}: FlightCabinOptionProps) {
  const { classes, cx } = useStyles();

  return (
    <button
      className={cx(classes.button, { [classes.active]: active })}
      onClick={() => onClick?.(cabinClass)}
    >
      <Text weight={500}>{getCabinClassName(cabinClass)}</Text>
      <Text size="xs" color="blue">
        <b>{availableSeatsCount}</b> seats
      </Text>
    </button>
  );
}

function getCabinClassName(cabinClass: CabinClass): string {
  switch (cabinClass) {
    case CabinClass.ECONOMY:
      return 'Economy';
    case CabinClass.BUSINESS:
      return 'Business';
    case CabinClass.FIRST:
      return 'First Class';
    default:
      return 'Unknown';
  }
}
