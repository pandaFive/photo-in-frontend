import { RedirectType, redirect } from 'next/navigation';

import { AccountData, getAccount } from '@/src/api/get-account';
import { isMember } from '@/src/util/is-member';

const Layout = async ({ children }) => {
  const account: AccountData | null = await getAccount();

  if (!isMember(account)) {
    redirect('/login', RedirectType.push);
  }

  return <>{children}</>;
};

export default Layout;
