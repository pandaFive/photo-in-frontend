'use client';

import * as React from 'react';

import AppBar from './AppBar';
import Drawer from './Drawer';
const HeaderContainer = () => {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <AppBar open={open} toggleDrawer={toggleDrawer} />
      <Drawer open={open} toggleDrawer={toggleDrawer} />
    </>
  );
};

export default HeaderContainer;
