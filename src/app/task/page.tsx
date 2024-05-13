import { redirect, RedirectType } from 'next/navigation';
import React from 'react';

import { getAccount } from '@/src/api/get-account';
import { getTasks } from '@/src/api/get-tasks';
import TaskList from '@/src/components/TaskList';

type Task = {
  [key: string]: string;
};

const TaskData = async () => {
  const data = await getTasks();
  const currentAccount = await getAccount();
  if (currentAccount !== null && currentAccount.role !== '0') {
    redirect('/login', RedirectType.push);
  }
  return (
    <TaskList id={0} type={'admin'} />
    // <Box
    //   sx={{
    //     flexGrow: 1,
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'f5f5f5',
    //   }}
    // >
    //   <Box
    //     component="main"
    //     sx={{
    //       overflow: 'auto',
    //       display: 'flex',
    //       flexDirection: 'column',
    //       justifyContent: 'center',
    //       maxWidth: '700px',
    //     }}
    //   >
    //     <Toolbar />
    //     {data?.map((task: Task) => (
    //       <TaskAccordion
    //         body={task.area}
    //         id={task.id}
    //         key={task.id}
    //         reload={() => 1}
    //         title={task.title}
    //         type={false}
    //       />
    //     ))}
    //   </Box>
    // </Box>
  );
};

export default TaskData;
