import { Box, Toolbar } from '@mui/material';
import { redirect } from 'next/dist/server/api-utils';
import React from 'react';

import { getAccount } from '@/src/api/get-account';
import { getTasks } from '@/src/api/get-tasks';
import TaskAccordion from '@/src/components/TaskAccordion';

const TaskData = async () => {
  const data = await getTasks();
  const currentAccount = await getAccount();
  if (currentAccount.role !== '0') {
    redirect('login');
  }
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'f5f5f5',
      }}
    >
      <Box
        component="main"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '700px',
        }}
      >
        <Toolbar />
        {data?.map((task) => (
          <TaskAccordion body={task.area} key={task.id} title={task.title} />
        ))}
        <TaskAccordion body="body" title="title" />
      </Box>
    </Box>
  );
};

export default TaskData;
