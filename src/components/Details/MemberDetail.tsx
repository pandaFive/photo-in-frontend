import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';
import { KeyedMutator } from 'swr';

import {
  BasicButton,
  OutlinedButton,
} from '@/src/components/Buttons/BasicButton';
import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { AccountData, Comment, Task } from '@/src/types';

type Props = {
  account: AccountData;
  comments: Comment[];
  isLoaded: boolean;
  id: string;
  cycleId: number;
  url: string;
  date: string;
  reload: (newDataType: string) => void;
  mutate: KeyedMutator<Task[]>;
  taskId: number;
};

const MemberDetail = (props: Props) => {
  const changeNG = async () => {
    await props.mutate(
      async (currentData) => {
        const res = await fetch(`/api/task/${String(props.id)}/ng`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to mark as NG');
        return currentData?.filter((task) => task.id !== props.taskId);
      },
      {
        optimisticData: (currentData) =>
          currentData?.filter((task) => task.id !== props.taskId),
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const changeComplete = async () => {
    await props.mutate(
      async (currentData) => {
        const res = await fetch(`/api/task/${String(props.id)}/complete`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to mark as complete');
        return currentData?.filter((task) => task.id !== props.taskId);
      },
      {
        optimisticData: (currentData) =>
          currentData?.filter((task) => task.id !== props.taskId),
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const onNG = (): void => {
    changeNG().catch((e) => console.error(e));
  };

  const onComplete = (): void => {
    changeComplete().catch((e) => console.error(e));
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
      <BasicButton onClick={onComplete} str="完了" />
      <OutlinedButton onClick={onNG} str="NG" />
    </AccordionDetails>
  );
};

export default MemberDetail;
