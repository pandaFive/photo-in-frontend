import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { useState } from 'react';

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
  const [flagFetchComments, setFlagFetchComments] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/aws?key=${props.task.title}`, {
        method: 'GET',
      });
      const url: string = (await res.json()) as string;
      setFileUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComment = async () => {
    try {
      const res = await fetch(
        `/api/comments?taskId=${String(props.task.id)}&accountId=${String(props.account.id)}`,
        {
          method: 'GET',
        },
      );
      const result: Comment[] = (await res.json()) as Comment[];
      setComments(result);
      setFlagFetchComments(true);
    } catch (err) {
      console.error(err);
    }
    setLoaded(true);
  };

  const onFetchFile = () => {
    if (fileUrl === '') {
      fetchFile()
        .then()
        .catch((e) => console.error(e));
    }
  };

  const onFetchComment = () => {
    if (comments.length === 0 && !flagFetchComments) {
      fetchComment()
        .then()
        .catch((e) => console.error(e));
    }
  };

  const onClickArrow = () => {
    onFetchComment();
    onFetchFile();
  };

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
            width={100}
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
