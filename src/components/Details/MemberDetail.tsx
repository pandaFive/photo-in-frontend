import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';

import {
  BasicButton,
  OutlinedButton,
} from '@/src/components/Buttons/BasicButton';
import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { AccountData } from '@/src/types';
import { Comment } from '@/src/types';

type Props = {
  account: AccountData;
  comments: Comment[];
  isLoaded: boolean;
  id: string;
  cycleId: number;
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
      {!props.isLoaded ? (
        <LoadCircle />
      ) : (
        <CommentList
          account={props.account}
          comments={props.comments}
          cycleId={props.cycleId}
        />
      )}
      <BasicButton onClick={onComplete} str="Complete" />
      <OutlinedButton onClick={onNG} str="NG" />
    </AccordionDetails>
  );
};

export default MemberDetail;
