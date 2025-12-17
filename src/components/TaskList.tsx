'use client';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
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

const buttonGroupStyle = {
  '& .MuiButton-root': {
    borderRadius: 0,
    bgcolor: '#667eea',
    px: 2.5,
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

  const mutateData = useMemo(() => {
    return grouping(data, sortType);
  }, [data, sortType]);

  const section = useMemo(() => {
    return sortSectionKeys(Object.keys(mutateData), sortType);
  }, [mutateData, sortType]);

  const totalTasks = data.length;

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
      }}
    >
      <Toolbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ページヘッダー */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: '#667eea',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                }}
              >
                <FormatListBulletedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                  タスク一覧
                </Typography>
                <Typography sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  {totalTasks}件のタスク
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <ButtonGroup
                aria-label="sort type"
                disableElevation
                sx={buttonGroupStyle}
                variant="contained"
              >
                <Button
                  disabled={sortType === 'time'}
                  onClick={() => onChangeType('time')}
                >
                  日付順
                </Button>
                <Button
                  disabled={sortType === 'area'}
                  onClick={() => onChangeType('area')}
                >
                  地域順
                </Button>
              </ButtonGroup>
              {props.account.role !== 'member' && (
                <ButtonGroup
                  aria-label="data type"
                  disableElevation
                  sx={buttonGroupStyle}
                  variant="contained"
                >
                  <Button
                    disabled={dataType === 'active'}
                    onClick={() => onChangeDataType('active')}
                  >
                    すべて
                  </Button>
                  <Button
                    disabled={dataType === 'NG'}
                    onClick={() => onChangeDataType('NG')}
                  >
                    NG
                  </Button>
                </ButtonGroup>
              )}
            </Box>
          </Box>
        </Paper>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* タスク一覧 */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <LoadCircle />
          </Box>
        ) : section.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              タスクがありません
            </Typography>
          </Paper>
        ) : (
          section.map((sectionName: string) => (
            <Paper
              elevation={0}
              key={sectionName}
              sx={{
                mb: 3,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              {/* セクションヘッダー */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: '#f8f9fc',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'text.primary',
                  }}
                >
                  {sectionName}
                </Typography>
                <Chip
                  label={`${mutateData[sectionName]?.length}件`}
                  size="small"
                  sx={{
                    bgcolor: '#667eea',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
              {/* タスクアコーディオン */}
              <Box sx={{ p: 2 }}>
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
              </Box>
            </Paper>
          ))
        )}
      </Container>
    </Box>
  );
};

export default TaskList;
