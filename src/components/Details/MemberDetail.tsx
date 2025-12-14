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
    // 楽観的にUIから削除
    void props.mutate(
      (currentData) => currentData?.filter((task) => task.id !== props.taskId),
      { revalidate: false },
    );

    try {
      await fetch(`/api/task/${String(props.id)}/ng`, {
        method: 'PUT',
      });
      void props.mutate(); // 成功時にサーバーデータで確定
    } catch (error) {
      void props.mutate(); // 失敗時はロールバック
    }
  };

  const changeComplete = async () => {
    // 楽観的にUIから削除
    void props.mutate(
      (currentData) => currentData?.filter((task) => task.id !== props.taskId),
      { revalidate: false },
    );

    try {
      await fetch(`/api/task/${String(props.id)}/complete`, {
        method: 'PUT',
      });
      void props.mutate(); // 成功時にサーバーデータで確定
    } catch (error) {
      void props.mutate(); // 失敗時はロールバック
    }
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
