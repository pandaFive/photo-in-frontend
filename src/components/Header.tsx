import * as React from 'react';

import { getAccount } from '@/src/api/get-account';
import HeaderContainer from '@/src/components/HeaderContainer';
import { AccountData } from '@/src/types';

const Header = async () => {
  const currentAccount: AccountData = (await getAccount()) as AccountData;
  const name: string = currentAccount !== null ? currentAccount?.name : '';
  const role: string = currentAccount !== null ? currentAccount?.role : '';
  console.log(currentAccount);

  if (currentAccount === null) {
    return <></>;
  }

  return (
    <>
      <HeaderContainer name={name} role={role} />
    </>
  );
};

export default Header;
