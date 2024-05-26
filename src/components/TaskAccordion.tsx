import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  AccordionDetails,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  title: string;
  body: string;
  type: boolean;
  id: string;
  index: number;
  time: string;
  reload: () => void;
};

const TaskAccordion = (props: Props) => {
  const [fileUrl, setFileUrl] = useState('');
  const changeNG = async () => {
    await fetch(`/api/task/${String(props.id)}/ng`, {
      method: 'PUT',
    });
    props.reload();
  };

  const changeComplete = async () => {
    await fetch(`/api/task/${String(props.id)}/complete`, {
      method: 'PUT',
    });
    props.reload();
  };

  const onNG = (): void => {
    changeNG()
      .then()
      .catch((e) => alert(e));
  };

  const onComplete = (): void => {
    changeComplete()
      .then()
      .catch((e) => alert(e));
  };

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/aws?key=${props.title}`, {
        method: 'GET',
      });
      const url = await res.json();
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

  const date = new Date(props.time);

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
          >{`${props.index + 1}.  地域：${props.body}`}</Typography>
          <Divider
            flexItem
            orientation="vertical"
            sx={{ borderRightWidth: 1, borderColor: 'gray' }}
          />
          <Typography mx={2}>{props.title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Link href={fileUrl} target="_blank">
            {'Open File in New Tab'}
          </Link>
          <Typography>{`振り分け日時：${date.toLocaleDateString()}`}</Typography>
          {props.type ? (
            <>
              <Button
                onClick={onComplete}
                sx={{ m: 1 }}
                tabIndex={-1}
                variant="contained"
              >
                Complete
              </Button>
              <Button onClick={onNG} tabIndex={-1} variant="outlined">
                NG
              </Button>
            </>
          ) : (
            <></>
          )}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default TaskAccordion;
