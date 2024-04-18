import { Box, Toolbar } from '@mui/material';

import TaskAccordion from '@/src/components/TaskAccordion';

const Account = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const data = await getAcountTasks(id);
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
