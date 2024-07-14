import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';

import { BasicButton } from '@/src/components/Buttons/BasicButton';
import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { Comment } from '@/src/types';
import { AccountData } from '@/src/types';

type Props = {
  account: AccountData;
  comments: Comment[];
  cycleId: number;
  isLoaded: boolean;
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
      {!props.isLoaded ? (
        <LoadCircle />
      ) : (
        <CommentList
          account={props.account}
          comments={props.comments}
          cycleId={props.cycleId}
        />
      )}
      {props.dataType === 'NG' ? (
        <BasicButton onClick={onReassign} str="再アサイン" />
      ) : (
        <></>
      )}
    </AccordionDetails>
  );
};

export default AdminDetail;
