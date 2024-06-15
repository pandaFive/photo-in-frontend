import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { useState } from 'react';

import AdminDetail from './Details/AdminDetail';
import MemberDetail from './Details/MemberDetail';

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
  task: MemberTask | AdminTask;
  index: number;
  type: string;
  reload: () => void;
};

const TaskAccordion = (props: Props) => {
  const [fileUrl, setFileUrl] = useState('');

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

  const onFetchFile = () => {
    if (fileUrl === '') {
      fetchFile()
        .then()
        .catch((e) => alert(e));
    }
  };

  const date = new Date(props.task.created_at);

  return (
    <Grid sx={{ mt: 1, mb: 1 }}>
      <Accordion
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '700px',
          borderTop: 1,
          borderTopColor: '#efefef',
        }}
      >
        <AccordionSummary
          aria-controls="task content"
          expandIcon={<ArrowDropDownIcon />}
          id="task header"
          onClick={onFetchFile}
        >
          <Typography
            mx={2}
            width={100}
          >{`${props.index + 1}.  地域：${props.task.area_name}`}</Typography>
          <Divider
            flexItem
            orientation="vertical"
            sx={{ borderRightWidth: 1, borderColor: 'gray' }}
          />
          <Typography mx={2}>{props.task.title}</Typography>
        </AccordionSummary>
        {'history_id' in props.task ? (
          <MemberDetail
            date={date.toLocaleDateString()}
            id={String(props.task.history_id)}
            reload={props.reload}
            url={fileUrl}
          />
        ) : (
          <AdminDetail date={date.toLocaleDateString()} url={fileUrl} />
        )}
      </Accordion>
    </Grid>
  );
};

export default TaskAccordion;
