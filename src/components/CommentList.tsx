'use client';

import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlots,
} from '@mui/x-data-grid';
import * as React from 'react';
import { useMemo, useCallback } from 'react';

import { useToast } from '@/src/context/ToastContext';
import { getNow } from '@/src/infra/time';
import { useCommentMutation } from '@/src/mutations';

import { AccountData } from '../types';
import { Comment } from '../types';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
  role: string;
  name: string;
}

/**
 * DataGridのツールバーコンポーネント
 * 新しいコメントを追加するためのボタンを提供する
 */
const EditToolbar = (props: EditToolbarProps) => {
  const { setRows, setRowModesModel, role, name } = props;

  /**
   * 新しいコメント行を追加し、編集モードに切り替える
   */
  const handleClick = () => {
    setRows((oldRows) => [
      ...oldRows,
      {
        id: 0,
        role,
        name,
        comment: '',
        joinDate: getNow(),
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [0]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" onClick={handleClick} startIcon={<AddIcon />}>
        Add comment
      </Button>
    </GridToolbarContainer>
  );
};

/**
 * コメントデータをDataGrid用の行データに変換する
 * @param comments - APIから取得したコメントの配列
 * @returns DataGridで使用可能な行データの配列
 */
const createRows = (comments: Comment[]): GridRowsProp => {
  if (!Array.isArray(comments) || comments.length === 0) {
    return [];
  }

  return comments.map((cur) => ({
    id: cur.id,
    name: cur.name,
    comment: cur.content,
    joinDate: cur.updatedAt,
    role: cur.role,
    isNew: false,
  }));
};

type Props = {
  account: AccountData;
  comments: Comment[];
  cycleId: number;
};

/**
 * コメント一覧を表示・編集するためのDataGridコンポーネント
 *
 * 状態管理:
 * - rows: 表示するコメント行のデータ
 * - rowModesModel: 各行の編集モード状態（表示/編集）
 * - flagCommentChange: コメントが変更されたかを追跡するフラグ
 * - flagNewComment: 新規コメントかどうかを追跡するフラグ（POST/PUTの判定に使用）
 */
const CommentList = (props: Props) => {
  const [rows, setRows] = React.useState(createRows(props.comments));
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );
  // コメントが変更されたかを追跡（保存時にAPIを呼び出すかの判定に使用）
  const [flagCommentChange, setFlagCommentChange] = React.useState(false);
  // 新規コメントかどうかを追跡（POST/PUTの判定に使用）
  const [flagNewComment, setFlagNewComment] = React.useState(false);

  const { createComment, updateComment, deleteComment } = useCommentMutation();
  const { showSuccess, showError } = useToast();

  const role: string = props.account.role;
  const name: string = props.account.name;

  const handleRowEditStop: GridEventListener<'rowEditStop'> = useCallback((
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  const handleEditClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
  }, []);

  const handleSaveClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.View } }));
    setFlagCommentChange(true);
    if (id === 0) {
      setFlagNewComment(true);
    }
  }, []);

  const handleDeleteClick = useCallback((id: GridRowId) => () => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    deleteComment(id as number)
      .then((result) => {
        if (result.success) {
          showSuccess('コメントを削除しました');
        } else {
          showError(result.error ?? 'コメントの削除に失敗しました');
        }
      })
      .catch((err) => {
        console.error('Failed to delete comment:', err);
        showError('コメントの削除に失敗しました');
      });
  }, [deleteComment, showSuccess, showError]);

  const handleCancelClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));

    setRows((prev) => {
      const editedRow = prev.find((row) => row.id === id);
      if (editedRow?.isNew) {
        return prev.filter((row) => row.id !== id);
      }
      return prev;
    });
  }, []);

  /**
   * コメントをAPIに保存する（新規作成または更新）
   * flagNewCommentの状態に応じてPOSTまたはPUTリクエストを送信
   *
   * @param newRow - 保存する行データ
   * @param updatedRow - 更新後の行データ（新規作成時にIDを更新するために使用）
   */
  const saveComment = useCallback(
    (newRow: GridRowModel, updatedRow: GridRowModel) => {
      if (flagNewComment) {
        // 新規コメント作成
        createComment(newRow.comment as string, props.account.id, props.cycleId)
          .then((result) => {
            if (result.success && result.data) {
              const newId = result.data.id;
              const newUpdatedRow = { ...updatedRow, id: newId };
              setRows((currentRows) =>
                currentRows.map((row) =>
                  row.id === newRow.id ? newUpdatedRow : row
                )
              );
              showSuccess('コメントを投稿しました');
            } else {
              showError(result.error ?? 'コメントの投稿に失敗しました');
            }
          })
          .catch((e) => {
            console.error('Failed to post comment:', e);
            showError('コメントの投稿に失敗しました');
          });
        setFlagNewComment(false);
      } else {
        // 既存コメント更新
        updateComment(newRow.comment as string, newRow.id as number)
          .then((result) => {
            if (result.success) {
              showSuccess('コメントを更新しました');
            } else {
              showError(result.error ?? 'コメントの更新に失敗しました');
            }
          })
          .catch((e) => {
            console.error('Failed to update comment:', e);
            showError('コメントの更新に失敗しました');
          });
      }
    },
    [flagNewComment, createComment, updateComment, props.account.id, props.cycleId, showSuccess, showError]
  );

  /**
   * 行の更新を処理し、必要に応じてAPIに保存する
   * DataGridの行編集が完了した際に呼び出される
   *
   * @param newRow - 更新された行データ
   * @returns 更新後の行データ
   */
  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const updatedRow = { ...newRow, isNew: false };
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === newRow.id ? updatedRow : row))
      );
      if (flagCommentChange) {
        saveComment(newRow, updatedRow);
        setFlagCommentChange(false);
      }
      return updatedRow;
    },
    [flagCommentChange, saveComment]
  );

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // columns定義をメモ化して不要な再レンダリングを防ぐ
  const columns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Name', width: 180, editable: false },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      align: 'left',
      headerAlign: 'left',
      editable: false,
    },
    {
      field: 'joinDate',
      headerName: 'Join date',
      type: 'date',
      width: 120,
      editable: false,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 350,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              key="save"
              label="Save"
              onClick={handleSaveClick(id)}
              sx={{
                color: 'primary.main',
              }}
            />,
            <GridActionsCellItem
              className="textPrimary"
              color="inherit"
              icon={<CancelIcon />}
              key="cancel"
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            className="textPrimary"
            color="inherit"
            icon={<EditIcon />}
            key="edit"
            label="Edit"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            color="inherit"
            icon={<DeleteIcon />}
            key="delete"
            label="Delete"
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ], [rowModesModel, handleSaveClick, handleCancelClick, handleEditClick, handleDeleteClick]);

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        columns={columns}
        editMode="row"
        onRowEditStop={handleRowEditStop}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        rowModesModel={rowModesModel}
        rows={rows}
        slotProps={{
          toolbar: {
            setRows,
            setRowModesModel,
            id: String(rows.length + 1),
            role,
            name,
          },
        }}
        slots={{
          toolbar: EditToolbar as GridSlots['toolbar'],
        }}
      />
    </Box>
  );
};

export default CommentList;
