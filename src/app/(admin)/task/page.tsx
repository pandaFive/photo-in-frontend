import { redirect, RedirectType } from 'next/navigation';
import React from 'react';

import { getAccount } from '@/src/api/get-account';
import TaskList from '@/src/components/TaskList';
import { AccountData } from '@/src/types';

const TaskData = async () => {
  const currentAccount: AccountData = (await getAccount()) as AccountData;
  if (currentAccount !== null && currentAccount.role !== 'admin') {
    redirect('/', RedirectType.push);
  }
  return <TaskList account={currentAccount} id={currentAccount.id} />;
};

export default TaskData;
