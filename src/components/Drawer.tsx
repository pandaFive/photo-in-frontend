'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { styled, Theme, CSSObject } from '@mui/material/styles';

import {
  MainListItems,
  SecondaryListItems,
} from '@/src/components/ListItems';

const drawerWidth: number = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const DrawerContainer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme),
      borderRight: 'none',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
      borderRight: 'none',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    },
  }),
}));

interface Props {
  toggleDrawer: () => void;
  open: boolean;
}

const Drawer = (props: Props) => {
  return (
    <DrawerContainer open={props.open} variant="permanent">
      <DrawerHeader>
        <IconButton
          onClick={props.toggleDrawer}
          sx={{
            color: '#667eea',
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Box sx={{ py: 1 }}>
        <List component="nav" sx={{ px: 1 }}>
          <MainListItems open={props.open} />
          <Divider sx={{ my: 2, mx: 1 }} />
          <SecondaryListItems open={props.open} />
        </List>
      </Box>
    </DrawerContainer>
  );
};

export default Drawer;
