import { redirect, RedirectType } from 'next/navigation';
import React from 'react';

import { getAccount } from '@/src/api/get-account';
import TaskList from '@/src/components/TaskList';

const TaskData = async () => {
  const currentAccount = await getAccount();
  if (currentAccount !== null && currentAccount.role !== '0') {
    redirect('/login', RedirectType.push);
  }
  return <TaskList id={0} type={'admin'} />;
};

export default TaskData;
