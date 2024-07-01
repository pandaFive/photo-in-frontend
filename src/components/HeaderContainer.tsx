'use client';

import * as React from 'react';

import AppBar from './AppBar';
import Drawer from './Drawer';

type Props = {
  name: string;
  role: string;
};

const HeaderContainer = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <AppBar
        name={props.name}
        open={open}
        role={props.role}
        toggleDrawer={toggleDrawer}
      />
      {props.role === 'admin' ? (
        <Drawer open={open} toggleDrawer={toggleDrawer} />
      ) : (
        <></>
      )}
    </>
  );
};

export default HeaderContainer;
