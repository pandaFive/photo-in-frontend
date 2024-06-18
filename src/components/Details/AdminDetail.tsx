import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';

import { BasicButton } from '../Buttons/BasicButton';

type Props = {
  url: string;
  date: string;
  id: string;
  dataType: string;
  reload: (newDataType: string) => void;
};

const AdminDetail = (props: Props) => {
  const putReassign = async () => {
    await fetch(`/api/task/${String(props.id)}/reassign`, {
      method: 'PUT',
    });
    props.reload(props.dataType);
  };

  const onReassign = (): void => {
    putReassign()
      .then()
      .catch((e) => console.error(e));
  };
  return (
    <AccordionDetails>
      <Link href={props.url} target="_blank">
        {'Open File in New Tab'}
      </Link>
      <Typography>{`登録日時：${props.date}`}</Typography>
      {props.dataType === 'NG' ? (
        <BasicButton onClick={onReassign} str="再アサイン" />
      ) : (
        <></>
      )}
    </AccordionDetails>
  );
};

export default AdminDetail;
