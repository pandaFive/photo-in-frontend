import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Tooltip from '@mui/material/Tooltip';
import * as React from 'react';

const listItemStyle = {
  borderRadius: 2,
  mb: 0.5,
  '&:hover': {
    bgcolor: 'rgba(102, 126, 234, 0.08)',
  },
  '&.Mui-selected': {
    bgcolor: 'rgba(102, 126, 234, 0.12)',
    '&:hover': {
      bgcolor: 'rgba(102, 126, 234, 0.16)',
    },
  },
};

const listItemIconStyle = {
  color: '#667eea',
  minWidth: 40,
};

interface ListItemsProps {
  open: boolean;
}

export const MainListItems = ({ open }: ListItemsProps) => (
  <React.Fragment>
    <Tooltip arrow disableHoverListener={open} placement="right" title="ダッシュボード">
      <ListItemButton href="/dashboard" sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <DashboardIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="ダッシュボード"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
    <Tooltip arrow disableHoverListener={open} placement="right" title="タスク一覧">
      <ListItemButton href="/task" sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <FormatListBulletedIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="タスク一覧"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
    <Tooltip arrow disableHoverListener={open} placement="right" title="アカウント一覧">
      <ListItemButton href="/members" sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <PeopleIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="アカウント一覧"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
    <Tooltip arrow disableHoverListener={open} placement="right" title="アカウント作成">
      <ListItemButton href="/account/create" sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <PersonAddAlt1Icon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="アカウント作成"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  </React.Fragment>
);

export const SecondaryListItems = ({ open }: ListItemsProps) => (
  <React.Fragment>
    {open && (
      <ListSubheader
        component="div"
        sx={{
          bgcolor: 'transparent',
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 600,
          lineHeight: 2.5,
        }}
      >
        レポート
      </ListSubheader>
    )}
    <Tooltip arrow disableHoverListener={open} placement="right" title="今月">
      <ListItemButton sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <AssignmentIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="今月"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
    <Tooltip arrow disableHoverListener={open} placement="right" title="前四半期">
      <ListItemButton sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <AssignmentIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="前四半期"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
    <Tooltip arrow disableHoverListener={open} placement="right" title="年間">
      <ListItemButton sx={listItemStyle}>
        <ListItemIcon sx={listItemIconStyle}>
          <AssignmentIcon />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary="年間"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  </React.Fragment>
);
