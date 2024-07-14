import { redirect, RedirectType } from 'next/navigation';

import { getAccount } from '@/src/api/get-account';
import TaskList from '@/src/components/TaskList';
import { AccountData } from '@/src/types';

const Account = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const currentAccount: AccountData = (await getAccount()) as AccountData;
  if (currentAccount === null || currentAccount.id !== parseInt(id)) {
    redirect('/login', RedirectType.push);
  } else {
    return <TaskList account={currentAccount} id={parseInt(id)} />;
  }
};

export default Account;
