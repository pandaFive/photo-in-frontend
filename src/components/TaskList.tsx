'use client';

import { Box, Toolbar } from '@mui/material';
import { Suspense, useEffect, useState } from 'react';

import TaskAccordion from './TaskAccordion';

type Task = {
  [key: string]: string;
};

type Props = {
  type: string;
  id: number;
};

const TaskList = (props: Props) => {
  const [data, setData] = useState<Task[]>([]);
  const getData =
    props.type === 'photographer'
      ? async () => {
          const inputData: {
            id: number;
          } = {
            id: props.id,
          };
          try {
            const res = await fetch(
              `/api/account/${String(inputData.id)}/tasks`,
              {
                method: 'GET',
                cache: 'no-store',
              },
            );
            const result: Task[] = (await res.json()) as Task[];
            setData(result);
          } catch (err) {
            console.error(err);
          }
        }
      : async () => {
          try {
            const res = await fetch(`/api/tasks`, {
              method: 'GET',
              cache: 'no-store',
            });
            const result: Task[] = (await res.json()) as Task[];
            setData(result);
          } catch (err) {
            console.error(err);
          }
        };
  const onUpdate = () => {
    getData()
      .then()
      .catch((e) => alert(e));
  };

  useEffect(() => {
    onUpdate();
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
        <Suspense fallback={<div>loading...</div>}>
          {data?.map((task: Task) => (
            <TaskAccordion
              body={task.area as string}
              id={task.history_id as string}
              key={task.id}
              reload={onUpdate}
              title={task.title as string}
              type={props.type === 'photographer'}
            />
          ))}
        </Suspense>
        <h1>hello world!</h1>
      </Box>
    </Box>
  );
};

export default TaskList;
