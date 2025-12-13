import { useCallback, useState } from 'react';
import useSWR from 'swr';

import { AccountData, Task } from '@/src/types';
import { fetcher } from '@/src/util/swr/fetcher';
import { SWR_KEYS } from '@/src/util/swr/keys';

type DataType = 'active' | 'NG';

type Params = {
  account: AccountData;
  id: number;
  initialType?: DataType;
};

export const useTaskListData = ({
  account,
  id,
  initialType = 'active',
}: Params) => {
  const [dataType, setDataType] = useState<DataType>(initialType);

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
  } = useSWR<Task[], Error>(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const changeDataType = useCallback((nextType: DataType) => {
    setDataType(nextType);
  }, []);

  const reloadCurrent = useCallback(() => {
    void boundMutate();
  }, [boundMutate]);

  return {
    data,
    dataType,
    isLoading,
    error: error ? 'タスクの取得に失敗しました' : null,
    changeDataType,
    reloadCurrent,
    mutate: boundMutate,
  };
};
