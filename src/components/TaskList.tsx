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
import { Suspense, useCallback, useEffect, useState } from 'react';

import { AccountData } from '../api/get-account';
import { Task } from '../types';
import { getMemberAssignTask } from '../util/actions/get-member-tasks';
import { getAllTasks, getNGTasks } from '../util/actions/get-tasks';
import { grouping } from '../util/grouping';

import TaskAccordion from './TaskAccordion';

type Props = {
  type: string;
  id: number;
  account: AccountData;
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
  const [dataType, setDataType] = useState<string>('active');
  const [section, setSection] = useState<string[]>([]);
  const [mutateData, setMutateData] = useState<GroupType>({});

  const getData = useCallback(
    async () => {
      try {
        const result: Task[] =
          props.type === 'photographer'
            ? ((await getMemberAssignTask(String(props.id))) as Task[])
            : ((await getAllTasks()) as Task[]);
        setData(result);
      } catch (err) {
        console.error(err);
      }
    },
    [props.type, props.id], // getDataの依存関係
  );

  const getNG = async () => {
    try {
      const result: Task[] = (await getNGTasks()) as Task[];
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  const onUpdate = useCallback(() => {
    getData()
      .then()
      .catch((e) => console.error(e));
  }, [getData]);

  const onChangeType = (type: string) => {
    setSortType(() => type);
  };

  const onChangeDataType = (newDataType: string) => {
    setDataType(newDataType);
    if (newDataType === 'NG') {
      getNG()
        .then()
        .catch((e) => console.error(e));
    } else if (newDataType === 'active') {
      getData()
        .then()
        .catch((e) => console.error(e));
    }
  };

  useEffect(() => {
    setMutateData(() => grouping(data, sortType));
  }, [data, sortType]);

  useEffect(() => {
    setSection(() => sortTasks(Object.keys(mutateData)));
  }, [mutateData]);

  useEffect(() => {
    onUpdate();
  }, [onUpdate]);

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            width: '400px',
          }}
        >
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
          {props.type !== 'photographer' ? (
            <ButtonGroup
              aria-label="data type"
              disableElevation
              sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
              variant="contained"
            >
              <Button
                disabled={dataType === 'active'}
                onClick={() => onChangeDataType('active')}
              >
                ALL
              </Button>
              <Button
                disabled={dataType === 'NG'}
                onClick={() => onChangeDataType('NG')}
              >
                NG
              </Button>
            </ButtonGroup>
          ) : (
            <></>
          )}
        </Box>
        <Suspense fallback={<div>loading...</div>}>
          {section?.map((sectionName: string) => (
            <Paper
              elevation={6}
              key={sectionName}
              sx={{ m: 2, p: 2, width: '1000px' }}
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
                  account={props.account}
                  dataType={dataType}
                  index={index}
                  key={task.id}
                  reload={onChangeDataType}
                  task={task}
                  type={props.type}
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
