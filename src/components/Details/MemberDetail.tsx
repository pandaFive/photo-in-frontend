import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';

import { BasicButton, OutlinedButton } from '../Buttons/BasicButton';

type Props = {
  id: string;
  url: string;
  date: string;
  reload: (newDataType: string) => void;
};

const MemberDetail = (props: Props) => {
  const changeNG = async () => {
    await fetch(`/api/task/${String(props.id)}/ng`, {
      method: 'PUT',
    });
    props.reload('active');
  };

  const changeComplete = async () => {
    await fetch(`/api/task/${String(props.id)}/complete`, {
      method: 'PUT',
    });
    props.reload('active');
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
      <BasicButton onClick={onComplete} str="Complete" />
      <OutlinedButton onClick={onNG} str="NG" />
    </AccordionDetails>
  );
};

export default MemberDetail;
