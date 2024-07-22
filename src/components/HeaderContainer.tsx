'use client';

import { redirect, RedirectType, usePathname } from 'next/navigation';
import * as React from 'react';

import AppBar from '@/src/components/AppBar';
import Drawer from '@/src/components/Drawer';

type Props = {
  name: string;
  role: string;
  accountId: number;
};

const HeaderContainer = (props: Props) => {
  const pathname = usePathname();
  if (pathname === '/') {
    if (props.role === 'admin') {
      redirect('/dashboard', RedirectType.push);
    } else if (props.role === 'member') {
      redirect(`/member/${props.accountId}`, RedirectType.push);
    }
  }
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
