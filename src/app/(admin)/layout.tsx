import { RedirectType, redirect } from 'next/navigation';

import { AccountData, getAccount } from '@/src/api/get-account';
import { isAdmin } from '@/src/util/is-admin';

const Layout = async ({ children }) => {
  const account: AccountData | null = await getAccount();

  if (!isAdmin(account)) {
    redirect('/login', RedirectType.push);
  }
  return <>{children}</>;
};

export default Layout;
