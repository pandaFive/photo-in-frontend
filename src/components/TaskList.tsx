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

import { getMemberAssignTask } from '../util/actions/get-member-tasks';
import { getAllTasks, getNGTasks } from '../util/actions/get-tasks';
import { grouping } from '../util/grouping';

import TaskAccordion from './TaskAccordion';

type Task = {
  id: number;
  title: string;
  area_name: string;
  created_at: string;
};

type MemberTask = Task & {
  history_id: number;
};

type AdminTask = Task & {
  cycle_id: number;
};

type Props = {
  type: string;
  id: number;
};

type GroupType = {
  [key: string]: (MemberTask | AdminTask)[];
};

const sortTasks = (list: string[]) => {
  return list.toSorted();
};

const TaskList = (props: Props) => {
  const [data, setData] = useState<MemberTask[] | AdminTask[]>([]);
  const [sortType, setSortType] = useState<string>('time');
  const [dataType, setDataType] = useState<string>('active');
  const [section, setSection] = useState<string[]>([]);
  const [mutateData, setMutateData] = useState<GroupType>({});

  const getData =
    props.type === 'photographer'
      ? async () => {
          try {
            const result: MemberTask[] | AdminTask[] =
              (await getMemberAssignTask(String(props.id))) as
                | MemberTask[]
                | AdminTask[];
            setData(result);
          } catch (err) {
            console.error(err);
          }
        }
      : async () => {
          try {
            const result: MemberTask[] | AdminTask[] = (await getAllTasks()) as
              | MemberTask[]
              | AdminTask[];
            setData(result);
          } catch (err) {
            console.error(err);
          }
        };

  const getNG = async () => {
    try {
      const result: AdminTask[] = (await getNGTasks()) as AdminTask[];
      setData(result);
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
              {mutateData[sectionName]?.map(
                (task: MemberTask | AdminTask, index: number) => (
                  <TaskAccordion
                    index={index}
                    key={task.id}
                    reload={onUpdate}
                    task={task}
                    type={props.type}
                  />
                ),
              )}
            </Paper>
          ))}
        </Suspense>
        <h1>hello world!</h1>
      </Box>
    </Box>
  );
};

export default TaskList;
