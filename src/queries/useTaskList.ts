import { useCallback, useState } from 'react';
import useSWR from 'swr';

import {
  taskListFetcher,
  TaskFetchError,
  isTaskFetchError,
} from '@/src/api/tasks';
import { toDisplayError } from '@/src/domain/types/error';
import { AccountData, Task } from '@/src/types';
import { SWR_KEYS } from '@/src/util/swr/keys';

type DataType = 'active' | 'NG';

type Params = {
  account: AccountData;
  id: number;
  initialType?: DataType;
};

type UseTaskListReturn = {
  data: Task[];
  dataType: DataType;
  isLoading: boolean;
  error: string | null;
  changeDataType: (nextType: DataType) => void;
  reloadCurrent: () => void;
  mutate: ReturnType<typeof useSWR<Task[], TaskFetchError>>['mutate'];
};

/**
 * タスク一覧を取得するSWR Query Hook
 *
 * 改善点:
 * - TaskFetchErrorによる詳細なエラー情報
 * - revalidateOnReconnect: false で意図しない再検証を防止
 */
export const useTaskList = ({
  account,
  id,
  initialType = 'active',
}: Params): UseTaskListReturn => {
  const [dataType, setDataType] = useState<DataType>(initialType);

  // dataTypeとroleに応じてSWRキーを決定
  const swrKey =
    dataType === 'NG'
      ? SWR_KEYS.ngTasks
      : account.role === 'member'
        ? SWR_KEYS.memberTasks(String(id))
        : SWR_KEYS.allTasks;

  const {
    data = [],
    error,
    isLoading,
    mutate: boundMutate,
  } = useSWR<Task[], TaskFetchError>(swrKey, taskListFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false, // 意図しない再検証を防止
    dedupingInterval: 2000,
  });

  const changeDataType = useCallback((nextType: DataType) => {
    setDataType(nextType);
  }, []);

  const reloadCurrent = useCallback(() => {
    void boundMutate();
  }, [boundMutate]);

  // エラーメッセージの生成
  const errorMessage = error
    ? isTaskFetchError(error)
      ? toDisplayError(error.domainError)
      : 'タスクの取得に失敗しました'
    : null;

  return {
    data,
    dataType,
    isLoading,
    error: errorMessage,
    changeDataType,
    reloadCurrent,
    mutate: boundMutate,
  };
};
