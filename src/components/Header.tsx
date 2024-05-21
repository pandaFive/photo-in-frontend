import * as React from 'react';

import { getAccount, AccountData } from '../api/get-account';

import HeaderContainer from './HeaderContainer';

const Header = async () => {
  const currentAccount: AccountData | null = await getAccount();
  const name: string = currentAccount !== null ? currentAccount?.name : '';
  const role: string = currentAccount !== null ? currentAccount?.role : '';

  return (
    <>
      <HeaderContainer name={name} role={role} />
    </>
  );
};

export default Header;
