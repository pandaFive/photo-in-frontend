'use client';

import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';
import { KeyedMutator } from 'swr';

import {
  BasicButton,
  OutlinedButton,
} from '@/src/components/Buttons/BasicButton';
import CommentList from '@/src/components/CommentList';
import LoadCircle from '@/src/components/LoadCircle';
import { useToast } from '@/src/context/ToastContext';
import { useTaskMutation } from '@/src/mutations';
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
  const { completeTask, markAsNG } = useTaskMutation(props.mutate);
  const { showSuccess, showErrorWithRetry } = useToast();

  const onNG = (): void => {
    markAsNG(props.taskId, props.id)
      .then((result) => {
        if (result.success) {
          showSuccess('タスクをNGにしました');
        } else {
          showErrorWithRetry(
            result.error ?? 'NG処理に失敗しました',
            () => onNG(),
          );
        }
      })
      .catch((e) => {
        console.error(e);
        showErrorWithRetry('NG処理に失敗しました', () => onNG());
      });
  };

  const onComplete = (): void => {
    completeTask(props.taskId, props.id)
      .then((result) => {
        if (result.success) {
          showSuccess('タスクを完了しました');
        } else {
          showErrorWithRetry(
            result.error ?? '完了処理に失敗しました',
            () => onComplete(),
          );
        }
      })
      .catch((e) => {
        console.error(e);
        showErrorWithRetry('完了処理に失敗しました', () => onComplete());
      });
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
