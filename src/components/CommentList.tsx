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

import { AccountData } from '../types';
import { Comment } from '../types';
import {
  fetchDeleteComment,
  fetchPostComment,
  fetchPutComment,
} from '../util/fetch-comment';

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
        joinDate: new Date(),
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

  const role: string = props.account.role;
  const name: string = props.account.name;

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    setFlagCommentChange(true);
    if (id === 0) {
      setFlagNewComment(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
    fetchDeleteComment(id as number)
      .then()
      .catch((err) => console.error(err));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  /**
   * コメントをAPIに保存する（新規作成または更新）
   * flagNewCommentの状態に応じてPOSTまたはPUTリクエストを送信
   *
   * @param newRow - 保存する行データ
   * @param updatedRow - 更新後の行データ（新規作成時にIDを更新するために使用）
   */
  const fetchPutOrPostComment = (
    newRow: GridRowModel,
    updatedRow: GridRowModel,
  ) => {
    if (flagNewComment) {
      // 新規コメント作成
      fetchPostComment(
        newRow.comment as string,
        props.account.id,
        props.cycleId,
      )
        .then((response) => {
          if (response) {
            const newId = response.id;
            const newUpdatedRow = { ...updatedRow, id: newId };
            setRows(
              rows.map((row) => (row.id === newRow.id ? newUpdatedRow : row)),
            );
          }
        })
        .catch((e) => console.error('Failed to post comment:', e));
      setFlagNewComment(false);
    } else {
      // 既存コメント更新
      fetchPutComment(newRow.comment as string, newRow.id as number)
        .then()
        .catch((e) => console.error('Failed to update comment:', e));
    }
  };

  /**
   * 行の更新を処理し、必要に応じてAPIに保存する
   * DataGridの行編集が完了した際に呼び出される
   *
   * @param newRow - 更新された行データ
   * @returns 更新後の行データ
   */
  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    if (flagCommentChange) {
      fetchPutOrPostComment(newRow, updatedRow);
      setFlagCommentChange(false);
    }
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
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
  ];

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
