'use client';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
import { logError } from '@/src/util/safe-logger';

type Props = {
  account: AccountData;
  comments: Comment[];
  cycleId: number;
  isLoaded: boolean;
  error: string | null;
  onRetry: () => void;
  url: string;
  date: string;
  id: string;
  dataType: string;
  reload: (newDataType: string) => void;
  mutate: KeyedMutator<Task[]>;
  taskId: number;
};

const AdminDetail = (props: Props) => {
  const { reassign } = useTaskMutation(props.mutate);
  const { showSuccess, showErrorWithRetry } = useToast();

  const onReassign = (): void => {
    reassign(props.taskId, props.id)
      .then((result) => {
        if (result.success) {
          showSuccess('タスクを再アサインしました');
        } else {
          showErrorWithRetry(
            result.error ?? '再アサインに失敗しました',
            () => onReassign(),
          );
        }
      })
      .catch((e) => {
        logError('[AdminDetail] reassign', e);
        showErrorWithRetry('再アサインに失敗しました', () => onReassign());
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
            label={`登録日: ${props.date}`}
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
        {props.dataType === 'NG' && (
          <Button
            onClick={onReassign}
            size="small"
            startIcon={<RefreshIcon />}
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
            再アサイン
          </Button>
        )}
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
          データの取得に失敗しました。再試行してください。
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

export default AdminDetail;
