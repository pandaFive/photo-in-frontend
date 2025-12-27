import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaceIcon from '@mui/icons-material/Place';
import {
  AccordionSummary,
  Accordion,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { memo, useState, useCallback } from 'react';
import { KeyedMutator } from 'swr';

import AdminDetail from '@/src/components/Details/AdminDetail';
import MemberDetail from '@/src/components/Details/MemberDetail';
import { toLocaleDateString } from '@/src/domain/functions/date';
import { useTaskDetail } from '@/src/queries';
import { AccountData, Task } from '@/src/types';

type Props = {
  account: AccountData;
  task: Task;
  index: number;
  type: string;
  dataType: string;
  reload: (newDataType: string) => void;
  mutate: KeyedMutator<Task[]>;
  taskId: number;
};

const TaskAccordion = (props: Props) => {
  const [expanded, setExpanded] = useState(false);
  // PERF-001: SWRの条件付きフェッチ - expandedがtrueの時のみデータ取得
  const { fileUrl, comments, isLoaded, error, mutate: mutateDetail } = useTaskDetail(
    props.task.id,
    props.task.task_title,
    props.account.id,
    expanded, // SWRがキャッシュ管理・重複リクエスト防止を自動で行う
  );

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded);
    },
    [],
  );

  // エラー時の再試行ハンドラー
  const handleRetry = useCallback(() => {
    void mutateDetail();
  }, [mutateDetail]);

  const formattedDate = toLocaleDateString(new Date(props.task.created_at));

  return (
    <Box sx={{ mb: 1 }}>
      <Accordion
        expanded={expanded}
        onChange={handleChange}
        sx={{
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
            borderColor: '#667eea',
          },
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(102, 126, 234, 0.5)',
          },
        }}
      >
        <AccordionSummary
          aria-controls={`task-${props.task.id}-content`}
          expandIcon={
            <ExpandMoreIcon
              sx={{
                color: '#667eea',
              }}
            />
          }
          id={`task-${props.task.id}-header`}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.04)',
            },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 2,
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              color: '#667eea',
              minWidth: 32,
            }}
          >
            {props.index + 1}
          </Typography>
          <Chip
            icon={<PlaceIcon sx={{ fontSize: 16 }} />}
            label={props.task.area_name}
            size="small"
            sx={{
              bgcolor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: '#667eea',
              },
            }}
          />
          <Typography
            sx={{
              flex: 1,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {props.task.task_title}
          </Typography>
        </AccordionSummary>
        {props.type === 'member' ? (
          <MemberDetail
            account={props.account}
            comments={comments}
            cycleId={props.task.assign_cycle_id}
            date={formattedDate}
            error={error}
            id={String(props.task.history_id)}
            isLoaded={isLoaded}
            mutate={props.mutate}
            onRetry={handleRetry}
            reload={props.reload}
            taskId={props.taskId}
            url={fileUrl}
          />
        ) : (
          <AdminDetail
            account={props.account}
            comments={comments}
            cycleId={props.task.assign_cycle_id}
            dataType={props.dataType}
            date={formattedDate}
            error={error}
            id={String(props.task.id)}
            isLoaded={isLoaded}
            mutate={props.mutate}
            onRetry={handleRetry}
            reload={props.reload}
            taskId={props.taskId}
            url={fileUrl}
          />
        )}
      </Accordion>
    </Box>
  );
};

export default memo(TaskAccordion);
