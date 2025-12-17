import { redirect, RedirectType } from 'next/navigation';

import { getAccount } from '@/src/api/get-account';
import TaskList from '@/src/components/TaskList';

const TaskData = async () => {
  const currentAccount = await getAccount();

  if (!currentAccount || currentAccount.role !== 'admin') {
    redirect('/', RedirectType.push);
  }

  return <TaskList account={currentAccount} id={currentAccount.id} />;
};

export default TaskData;
