'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Tooltip,
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
  backgroundColor: '#667eea',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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

const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

const getRoleLabel = (role: string): string => {
  return role === 'admin' ? '管理者' : 'メンバー';
};

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
      <Toolbar sx={{ py: 1 }}>
        {props.role === 'admin' && (
          <Tooltip title="メニューを開く">
            <IconButton
              aria-label="open drawer"
              color="inherit"
              edge="start"
              onClick={props.toggleDrawer}
              sx={{
                marginRight: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
                ...(props.open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              fontWeight: 700,
            }}
          >
            {getInitials(props.name)}
          </Avatar>
          <Box>
            <Typography
              component="h1"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: 0.5,
              }}
            >
              {props.name}
            </Typography>
            <Chip
              icon={<PersonIcon sx={{ fontSize: 14, color: 'inherit !important' }} />}
              label={getRoleLabel(props.role)}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
        </Box>

        <Tooltip title="ログアウト">
          <IconButton
            aria-label="logout"
            color="inherit"
            onClick={toggledOpen}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>

        <Dialog
          aria-describedby="logout-dialog-description"
          aria-labelledby="logout-dialog-title"
          maxWidth="xs"
          onClose={toggledOpen}
          open={open}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                p: 1,
              },
            },
          }}
        >
          <DialogTitle
            id="logout-dialog-title"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              pb: 1,
            }}
          >
            ログアウト
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="logout-dialog-description"
              sx={{ textAlign: 'center' }}
            >
              ログアウトしてもよろしいですか？
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
            <Button
              onClick={toggledOpen}
              sx={{
                borderRadius: 2,
                px: 3,
              }}
              variant="outlined"
            >
              キャンセル
            </Button>
            <Button
              autoFocus
              onClick={onLogout}
              sx={{
                borderRadius: 2,
                px: 3,
                bgcolor: '#667eea',
                '&:hover': {
                  bgcolor: '#5a6fd6',
                },
              }}
              variant="contained"
            >
              ログアウト
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBarContainer>
  );
};

export default AppBar;
