import { AccordionDetails, Button, Typography } from '@mui/material';
import Link from 'next/link';

type Props = {
  id: string;
  url: string;
  date: string;
  reload: () => void;
};

const MemberDetail = (props: Props) => {
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
      .catch((e) => console.error(e));
  };

  const onComplete = (): void => {
    changeComplete()
      .then()
      .catch((e) => console.error(e));
  };

  return (
    <AccordionDetails>
      <Link href={props.url} target="_blank">
        {'Open File in New Tab'}
      </Link>
      <Typography>{`振り分け日時：${props.date}`}</Typography>
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
    </AccordionDetails>
  );
};

export default MemberDetail;
