import { Box, Toolbar } from '@mui/material';
import { redirect, RedirectType } from 'next/navigation';

import { getAccount } from '@/src/api/get-account';
import getAccountTasks from '@/src/api/get-account-tasks';
import TaskAccordion from '@/src/components/TaskAccordion';

const Account = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const currentAccount = await getAccount();
  if (currentAccount === null || currentAccount.id !== parseInt(id)) {
    redirect('/login', RedirectType.push);
  }
  const data = await getAccountTasks(id);

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

export default Account;
