'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { Suspense, useEffect, useState } from 'react';

import { grouping } from '../util/grouping';

import TaskAccordion from './TaskAccordion';

type Task = {
  id: number;
  title: string;
  area_name: string;
  created_at: string;
  history_id: number;
};

type Props = {
  type: string;
  id: number;
};

type GroupType = {
  [key: string]: Task[];
};

const sortTasks = (list: string[]) => {
  return list.toSorted();
};

const TaskList = (props: Props) => {
  const [data, setData] = useState<Task[]>([]);
  const [sortType, setSortType] = useState<string>('time');
  const [section, setSection] = useState<string[]>([]);
  const [mutateData, setMutateData] = useState<GroupType>({});

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
            setData(() => result);
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
            setData(() => result);
          } catch (err) {
            console.error(err);
          }
        };

  const onUpdate = () => {
    getData()
      .then()
      .catch((e) => console.error(e));
  };

  const onChangeType = (type: string) => {
    setSortType(() => type);
  };

  useEffect(() => {
    setMutateData(() => grouping(data, sortType));
  }, [data, sortType]);

  useEffect(() => {
    setSection(() => sortTasks(Object.keys(mutateData)));
  }, [mutateData]);

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
      }}
    >
      <Box
        component="main"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '1500px',
        }}
      >
        <Toolbar />
        <ButtonGroup
          aria-label="sort type"
          disableElevation
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          variant="contained"
        >
          <Button
            disabled={sortType === 'time'}
            onClick={() => onChangeType('time')}
          >
            日付
          </Button>
          <Button
            disabled={sortType === 'area'}
            onClick={() => onChangeType('area')}
          >
            地域
          </Button>
        </ButtonGroup>
        <Suspense fallback={<div>loading...</div>}>
          {section?.map((sectionName: string) => (
            <Paper
              elevation={6}
              key={sectionName}
              sx={{ m: 2, p: 2, width: '900px' }}
            >
              <Typography component="h4" key={sectionName} variant="h4">
                {sectionName}
              </Typography>
              <Typography
                component="h5"
                variant="h5"
              >{`${mutateData[sectionName]?.length}件`}</Typography>
              <Divider />
              {mutateData[sectionName]?.map((task: Task, index: number) => (
                <TaskAccordion
                  body={task.area_name}
                  id={String(task.history_id)}
                  index={index}
                  key={task.id}
                  reload={onUpdate}
                  time={task.created_at}
                  title={task.title}
                  type={props.type === 'photographer'}
                />
              ))}
            </Paper>
          ))}
        </Suspense>
        <h1>hello world!</h1>
      </Box>
    </Box>
  );
};

export default TaskList;
