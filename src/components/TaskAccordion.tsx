import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';

import { AccountData } from '../types';
import { Comment, Task } from '../types';

import AdminDetail from './Details/AdminDetail';
import MemberDetail from './Details/MemberDetail';

type Props = {
  account: AccountData;
  task: Task;
  index: number;
  type: string;
  dataType: string;
  reload: (newDataType: string) => void;
};

const TaskAccordion = (props: Props) => {
  const [fileUrl, setFileUrl] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * ファイルURLとコメントを並列で取得する
   * AbortControllerを使用してコンポーネントアンマウント時にリクエストをキャンセル
   */
  const fetchData = async () => {
    // 既存のリクエストがある場合はキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // ファイルURLとコメントを並列で取得
      const [fileRes, commentRes] = await Promise.all([
        fetch(`/api/aws?key=${props.task.title}`, {
          method: 'GET',
          signal,
        }),
        fetch(
          `/api/comments?taskId=${String(props.task.id)}&accountId=${String(props.account.id)}`,
          {
            method: 'GET',
            signal,
          },
        ),
      ]);

      const url: string = (await fileRes.json()) as string;
      const result: Comment[] = (await commentRes.json()) as Comment[];

      setFileUrl(url);
      setComments(result);
      setLoaded(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to fetch task data:', err);
      }
    }
  };

  const onClickArrow = () => {
    if (!loaded) {
      fetchData()
        .then()
        .catch((e) => console.error(e));
    }
  };

  // コンポーネントアンマウント時にリクエストをキャンセル
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const date = new Date(props.task.created_at);

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
            date={date.toLocaleDateString()}
            id={String(props.task.history_id)}
            isLoaded={loaded}
            reload={props.reload}
            url={fileUrl}
          />
        ) : (
          <AdminDetail
            account={props.account}
            comments={comments}
            cycleId={props.task.assign_cycle_id}
            dataType={props.dataType}
            date={date.toLocaleDateString()}
            id={String(props.task.id)}
            isLoaded={loaded}
            reload={props.reload}
            url={fileUrl}
          />
        )}
      </Accordion>
    </Grid>
  );
};

export default TaskAccordion;
