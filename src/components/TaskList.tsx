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
import { useCallback, useMemo, useState } from 'react';

import LoadCircle from '@/src/components/LoadCircle';
import TaskAccordion from '@/src/components/TaskAccordion';
import { sortDateStrings } from '@/src/domain/functions/date';
import { useTaskList } from '@/src/queries';
import { AccountData } from '@/src/types';
import { Task } from '@/src/types';
import { grouping } from '@/src/util/grouping';

type Props = {
  id: number;
  account: AccountData;
};

const sortSectionKeys = (list: string[], sortType: string): string[] => {
  if (sortType === 'time') {
    return sortDateStrings(list);
  } else {
    return list.toSorted();
  }
};

const TaskList = (props: Props) => {
  const [sortType, setSortType] = useState<string>('time');
  const { data, dataType, isLoading, error, changeDataType, mutate } =
    useTaskList({ account: props.account, id: props.id });

  const onChangeType = useCallback((type: string) => {
    setSortType(type);
  }, []);

  const onChangeDataType = useCallback(
    (newDataType: string) => {
      changeDataType(newDataType === 'NG' ? 'NG' : 'active');
    },
    [changeDataType],
  );

  // dataとsortTypeからmutateDataを計算（メモ化）
  const mutateData = useMemo(() => {
    return grouping(data, sortType);
  }, [data, sortType]);

  // mutateDataとsortTypeからsectionを計算（メモ化）
  const section = useMemo(() => {
    return sortSectionKeys(Object.keys(mutateData), sortType);
  }, [mutateData, sortType]);

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
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
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
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'center',
              '& .MuiButton-root': {
                borderRadius: 0,
                bgcolor: '#667eea',
                '&:hover': {
                  bgcolor: '#5a6fd6',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(102, 126, 234, 0.5)',
                  color: 'white',
                },
              },
              '& .MuiButton-root:first-of-type': {
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              },
              '& .MuiButton-root:last-of-type': {
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              },
            }}
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
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                '& .MuiButton-root': {
                  borderRadius: 0,
                  bgcolor: '#667eea',
                  '&:hover': {
                    bgcolor: '#5a6fd6',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(102, 126, 234, 0.5)',
                    color: 'white',
                  },
                },
                '& .MuiButton-root:first-of-type': {
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                },
                '& .MuiButton-root:last-of-type': {
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                },
              }}
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
                  mutate={mutate}
                  reload={onChangeDataType}
                  task={task}
                  taskId={task.id}
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
