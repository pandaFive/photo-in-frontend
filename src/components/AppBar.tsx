'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

import { logoutAction } from '../util/actions/logout';

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBarContainer = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

type Props = {
  toggleDrawer: () => void;
  open: boolean;
  name: string;
  role: string;
};

const AppBar = (props: Props) => {
  const [open, setOpen] = useState(false);

  const toggledOpen = () => {
    setOpen(!open);
  };

  const onLogout = () => {
    logoutAction();
  };

  return (
    <AppBarContainer open={props.open} position="fixed">
      <Toolbar>
        {props.role === 'admin' ? (
          <IconButton
            aria-label="open drawer"
            color="inherit"
            edge="start"
            onClick={props.toggleDrawer}
            sx={{
              marginRight: 5,
              ...(props.open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <></>
        )}

        <Typography
          color="inherit"
          component="h1"
          noWrap
          sx={{ flexGrow: 1 }}
          variant="h6"
        >
          {props.name}
        </Typography>
        <IconButton
          aria-label="logout"
          color="inherit"
          onClick={toggledOpen}
          type="submit"
        >
          <LogoutIcon />
        </IconButton>
        <Dialog
          aria-describedby="alert-dialog"
          aria-labelledby="alert-dialog"
          fullWidth
          onClose={toggledOpen}
          open={open}
        >
          <DialogTitle id="alert-dialog-title">
            {'ログアウトしますか？'}
          </DialogTitle>
          <DialogActions>
            <Button onClick={toggledOpen}>キャンセル</Button>
            <Button autoFocus onClick={onLogout}>
              ログアウト
            </Button>
          </DialogActions>
        </Dialog>
        {/* <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton> */}
      </Toolbar>
    </AppBarContainer>
  );
};

export default AppBar;
