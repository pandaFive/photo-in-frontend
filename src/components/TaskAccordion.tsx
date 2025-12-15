import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { useEffect } from 'react';
import { memo } from 'react';
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
  const {
    fileUrl,
    comments,
    isLoaded,
    fetchData,
    cleanup,
  } = useTaskDetail(props.task.id, props.task.title, props.account.id);

  const onClickArrow = () => {
    if (!isLoaded) {
      void fetchData();
    }
  };

  // コンポーネントアンマウント時にリクエストをキャンセル
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const formattedDate = toLocaleDateString(new Date(props.task.created_at));

  return (
    <Grid sx={{ mt: 1, mb: 1 }} width={'98%'}>
      <Accordion
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderTop: 1,
          borderTopColor: '#efefef',
        }}
      >
        <AccordionSummary
          aria-controls="task content"
          expandIcon={<ArrowDropDownIcon />}
          id="task header"
          onClick={onClickArrow}
        >
          <Typography
            mx={2}
            width={150}
          >{`${String(props.index + 1)}.  地域：${props.task.area_name}`}</Typography>
          <Divider
            flexItem
            orientation="vertical"
            sx={{ borderRightWidth: 1, borderColor: 'gray' }}
          />
          <Typography mx={2}>{props.task.title}</Typography>
        </AccordionSummary>
        {props.type === 'member' ? (
          <MemberDetail
            account={props.account}
            comments={comments}
            cycleId={props.task.assign_cycle_id}
            date={formattedDate}
            id={String(props.task.history_id)}
            isLoaded={isLoaded}
            mutate={props.mutate}
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
            id={String(props.task.id)}
            isLoaded={isLoaded}
            mutate={props.mutate}
            reload={props.reload}
            taskId={props.taskId}
            url={fileUrl}
          />
        )}
      </Accordion>
    </Grid>
  );
};

export default memo(TaskAccordion);
