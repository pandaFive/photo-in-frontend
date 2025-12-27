'use client';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AccordionDetails, Alert, Box, Button, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import { KeyedMutator } from 'swr';

import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { useToast } from '@/src/context/ToastContext';
import { useTaskMutation } from '@/src/mutations';
import { AccountData, Comment, Task } from '@/src/types';

type Props = {
  account: AccountData;
  comments: Comment[];
  isLoaded: boolean;
  error: string | null;
  onRetry: () => void;
  id: string;
  cycleId: number;
  url: string;
  date: string;
  reload: (newDataType: string) => void;
  mutate: KeyedMutator<Task[]>;
  taskId: number;
};

const MemberDetail = (props: Props) => {
  const { completeTask, markAsNG } = useTaskMutation(props.mutate);
  const { showSuccess, showErrorWithRetry } = useToast();

  const onNG = (): void => {
    markAsNG(props.taskId, props.id)
      .then((result) => {
        if (result.success) {
          showSuccess('タスクをNGにしました');
        } else {
          showErrorWithRetry(
            result.error ?? 'NG処理に失敗しました',
            () => onNG(),
          );
        }
      })
      .catch((e) => {
        console.error(e);
        showErrorWithRetry('NG処理に失敗しました', () => onNG());
      });
  };

  const onComplete = (): void => {
    completeTask(props.taskId, props.id)
      .then((result) => {
        if (result.success) {
          showSuccess('タスクを完了しました');
        } else {
          showErrorWithRetry(
            result.error ?? '完了処理に失敗しました',
            () => onComplete(),
          );
        }
      })
      .catch((e) => {
        console.error(e);
        showErrorWithRetry('完了処理に失敗しました', () => onComplete());
      });
  };

  return (
    <AccordionDetails sx={{ bgcolor: '#fafbfc', pt: 2 }}>
      {/* 情報バー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
            label={`振り分け日: ${props.date}`}
            size="small"
            sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}
          />
          <Link href={props.url} passHref target="_blank">
            <Button
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{
                color: '#667eea',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              ファイルを開く
            </Button>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onComplete}
            size="small"
            startIcon={<CheckCircleIcon />}
            sx={{
              bgcolor: '#667eea',
              color: 'white',
              borderRadius: 2,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#5a6fd6',
              },
            }}
            variant="contained"
          >
            完了
          </Button>
          <Button
            onClick={onNG}
            size="small"
            startIcon={<DoNotDisturbIcon />}
            sx={{
              color: '#667eea',
              borderColor: '#667eea',
              borderRadius: 2,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#5a6fd6',
                bgcolor: 'rgba(102, 126, 234, 0.08)',
              },
            }}
            variant="outlined"
          >
            NG
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* コメントセクション */}
      {props.error ? (
        <Alert
          action={
            <Button
              color="inherit"
              onClick={props.onRetry}
              size="small"
              startIcon={<RefreshIcon />}
            >
              再試行
            </Button>
          }
          icon={<ErrorOutlineIcon />}
          severity="error"
          sx={{ borderRadius: 2 }}
        >
          {props.error}
        </Alert>
      ) : !props.isLoaded ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <LoadCircle />
        </Box>
      ) : (
        <CommentList
          account={props.account}
          comments={props.comments}
          cycleId={props.cycleId}
        />
      )}
    </AccordionDetails>
  );
};

export default MemberDetail;
