import { useCallback, useEffect, useRef, useState } from 'react';

import { AccountData, Task } from '@/src/types';
import { getMemberAssignTask } from '@/src/util/actions/get-member-tasks';
import { getAllTasks, getNGTasks } from '@/src/util/actions/get-tasks';

type DataType = 'active' | 'NG';

type Params = {
  account: AccountData;
  id: number;
  initialType?: DataType;
};

export const useTaskListData = ({ account, id, initialType = 'active' }: Params) => {
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<Task[]>([]);
  const [dataType, setDataType] = useState<DataType>(initialType);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (targetType: DataType) => {
      const controller = new AbortController();
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = controller;

      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      setIsLoading(true);
      setError(null);

      try {
        const result =
          targetType === 'NG'
            ? await getNGTasks(controller.signal)
            : account.role === 'member'
              ? await getMemberAssignTask(String(id), controller.signal)
              : await getAllTasks(controller.signal);

        if (requestIdRef.current !== currentRequestId) {
          return;
        }
        setData(result);
        setDataType(targetType);
      } catch (err) {
        if (requestIdRef.current !== currentRequestId) {
          return;
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.error('Failed to fetch task data:', err);
        setError('タスクの取得に失敗しました');
        setData([]);
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    },
    [account.role, id],
  );

  const changeDataType = useCallback(
    (nextType: DataType) => {
      if (nextType === dataType) return;
      fetchTasks(nextType)
        .then()
        .catch((e) => console.error(e));
    },
    [dataType, fetchTasks],
  );

  const reloadCurrent = useCallback(() => {
    fetchTasks(dataType)
      .then()
      .catch((e) => console.error(e));
  }, [dataType, fetchTasks]);

  useEffect(() => {
    fetchTasks(initialType)
      .then()
      .catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTasks, initialType, account.role, id]);

  return {
    data,
    dataType,
    isLoading,
    error,
    changeDataType,
    reloadCurrent,
  };
};
