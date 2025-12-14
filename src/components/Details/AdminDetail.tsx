import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';
import { KeyedMutator } from 'swr';

import { BasicButton } from '@/src/components/Buttons/BasicButton';
import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { AccountData, Comment, Task } from '@/src/types';

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
  mutate: KeyedMutator<Task[]>;
  taskId: number;
};

const AdminDetail = (props: Props) => {
  const putReassign = async () => {
    await props.mutate(
      async (currentData) => {
        const res = await fetch(`/api/task/${String(props.id)}/reassign`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to reassign');
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

  const onReassign = (): void => {
    putReassign().catch((e) => console.error(e));
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
