'use client';
import { Box, Toolbar } from '@mui/material';
import React from 'react';

import { getTasks, Task } from '@/src/api/get-tasks';
import TaskAccordion from '@/src/components/TaskAccordion';

// const Task = async () => {
//   const data = await getTasks();
//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'f5f5f5',
//       }}
//     >
//       <Box
//         component="main"
//         sx={{
//           overflow: 'auto',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '700px',
//         }}
//       >
//         <Toolbar />
//         {data?.map((task) => (
//           <TaskAccordion body={task.area} key={task.id} title={task.title} />
//         ))}
//         <TaskAccordion body="body" title="title" />
//       </Box>
//     </Box>
//   );
// };

const TaskData = () => {
  const [data, setData] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await getTasks();
      setData(response);
    };
    void fetchData();
  }, []);

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
