import * as React from 'react';

import { getAccount } from '../api/get-account';

import HeaderContainer from './HeaderContainer';

const Header = async () => {
  const currentAccount = await getAccount();
  return (
    <>
      <HeaderContainer />
    </>
  );
};

export default Header;
