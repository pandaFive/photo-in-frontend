import { RedirectType, redirect } from 'next/navigation';

import { getAccount } from '@/src/api/get-account';
import { isAdmin } from '@/src/util/is-admin';

const Layout = async ({ children }) => {
  const account = await getAccount();

  if (!isAdmin(account)) {
    redirect('/', RedirectType.push);
  }
  return <>{children}</>;
};

export default Layout;
