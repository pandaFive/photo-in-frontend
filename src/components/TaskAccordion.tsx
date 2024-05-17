import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  AccordionDetails,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  title: string;
  body: string;
  type: boolean;
  id: string;
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
    fetchFile()
      .then()
      .catch((e) => alert(e));
  };

  return (
    <Grid>
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          // height: 200,
          width: '700px',
        }}
      >
        <Accordion>
          <AccordionSummary
            aria-controls="task content"
            expandIcon={<ArrowDropDownIcon />}
            id="task header"
            onClick={onFetchFile}
          >
            <Typography>{props.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{props.body}</Typography>
            <Link href={fileUrl} target="_blank">
              {'Open File in New Tab'}
            </Link>
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
      </Paper>
    </Grid>
  );
};

export default TaskAccordion;
