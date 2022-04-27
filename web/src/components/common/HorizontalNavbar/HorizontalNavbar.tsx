import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Paper,
  Transition,
} from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import SkylineLogo from '@assets/logo.svg';
import Link from 'next/link';

const HEADER_HEIGHT = 72;

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
    borderBottom: 0,
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
    },
  },
}));

export interface HorizontalNavbarProps {
  links: { link: string; label: string }[];
}

export default function HorizontalNavbar({ links }: HorizontalNavbarProps) {
  const [opened, toggleOpened] = useBooleanToggle(false);
  const { classes } = useStyles();

  const items = links.map((link) => (
    <Link key={link.label} href={link.link}>
      <a
        key={link.label}
        className={classes.link}
        onClick={() => toggleOpened(false)}
      >
        {link.label}
      </a>
    </Link>
  ));

  return (
    <Header height={HEADER_HEIGHT} className={classes.root}>
      <Container className={classes.header} size="xl" px="xl">
        <Link href="/">
          <a>
            <SkylineLogo
              height={HEADER_HEIGHT * 0.6}
              // See: https://stackoverflow.com/questions/27999522/anchor-tag-generates-unwanted-height
              style={{ verticalAlign: 'bottom' }}
            />
          </a>
        </Link>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>

        <Burger
          opened={opened}
          onClick={() => toggleOpened()}
          className={classes.burger}
          size="sm"
        />

        <Transition transition="scale-y" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Container>
    </Header>
  );
}
