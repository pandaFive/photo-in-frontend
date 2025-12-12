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
import { useCallback, useEffect, useMemo, useState } from 'react';

import LoadCircle from '@/src/components/LoadCircle';
import TaskAccordion from '@/src/components/TaskAccordion';
import { AccountData } from '@/src/types';
import { Task } from '@/src/types';
import { getMemberAssignTask } from '@/src/util/actions/get-member-tasks';
import { getAllTasks, getNGTasks } from '@/src/util/actions/get-tasks';
import { grouping } from '@/src/util/grouping';

type Props = {
  id: number;
  account: AccountData;
};

const sortTasks = (list: string[], sortType: string) => {
  if (sortType === 'time') {
    return list.toSorted(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  } else {
    return list.toSorted();
  }
};

const TaskList = (props: Props) => {
  const [data, setData] = useState<Task[]>([]);
  const [sortType, setSortType] = useState<string>('time');
  const [dataType, setDataType] = useState<string>('active');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getData = useCallback(
    async () => {
      try {
        const result =
          props.account.role === 'member'
            ? await getMemberAssignTask(String(props.id))
            : await getAllTasks();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch task data:', err);
        // エラー時は空配列を設定して画面が壊れるのを防ぐ
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [props.account.role, props.id], // getDataの依存関係
  );

  const getNG = useCallback(async () => {
    try {
      const result = await getNGTasks();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch NG tasks:', err);
      // エラー時は空配列を設定して画面が壊れるのを防ぐ
      setData([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const onUpdate = useCallback(() => {
    getData()
      .then()
      .catch((e) => console.error(e));
  }, [getData]);

  const onChangeType = useCallback((type: string) => {
    setSortType(type);
  }, []);

  const onChangeDataType = useCallback(
    (newDataType: string) => {
      setDataType(newDataType);
      setIsLoading(true);
      const fetcher = newDataType === 'NG' ? getNG : getData;
      fetcher()
        .then()
        .catch((e) => console.error(e));
    },
    [getData, getNG],
  );

  // dataとsortTypeからmutateDataを計算（メモ化）
  const mutateData = useMemo(() => {
    return grouping(data, sortType);
  }, [data, sortType]);

  // mutateDataとsortTypeからsectionを計算（メモ化）
  const section = useMemo(() => {
    return sortTasks(Object.keys(mutateData), sortType);
  }, [mutateData, sortType]);

  // 初回マウント時のみデータ取得
  useEffect(() => {
    onUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {props.account.role !== 'member' ? (
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
        {isLoading ? (
          <LoadCircle />
        ) : (
          section?.map((sectionName: string) => (
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
                  type={props.account.role}
                />
              ))}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default TaskList;
