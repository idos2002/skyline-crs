import { Box } from '@mantine/core';
import { Plane } from 'tabler-icons-react';

export default function PlaneDivider() {
  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        position: 'relative',
        textAlign: 'center',

        '::before': {
          content: '""',
          position: 'absolute',
          display: 'block',
          backgroundColor: theme.colors.dark[9],
          width: '40%',
          height: '2px',
          left: 0,
          top: '50%',
        },

        '::after': {
          content: '""',
          position: 'absolute',
          display: 'block',
          backgroundColor: theme.colors.dark[9],
          width: '40%',
          height: '2px',
          right: 0,
          top: '50%',
        },
      })}
    >
      <Plane style={{ verticalAlign: 'bottom' }} />
    </Box>
  );
}
