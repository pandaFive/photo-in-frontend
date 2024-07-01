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

import { AccountData } from '../api/get-account';
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

const EditToolbar = (props: EditToolbarProps) => {
  const { setRows, setRowModesModel, role, name } = props;

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

const createRows = (comments: Comment[]) => {
  let newRows: GridRowsProp = [];
  if (Array.isArray(comments) && comments.length !== 0) {
    comments?.forEach((cur) => {
      newRows = [
        ...newRows,
        {
          id: cur.id,
          name: cur.name,
          comment: cur.content,
          joinDate: cur.updatedAt,
          role: cur.role,
          isNew: false,
        },
      ];
    }, []);
  }
  return newRows;
};

type Props = {
  account: AccountData;
  comments: Comment[];
  cycleId: number;
};

const CommentList = (props: Props) => {
  const [rows, setRows] = React.useState(createRows(props.comments));
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );
  const [flagCommentChange, setFlagCommentChange] = React.useState(false);
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
    if (id == 0) {
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

  const fetchPutOrPostComment = (
    newRow: GridRowModel,
    updatedRow: GridRowModel,
  ) => {
    if (flagNewComment) {
      fetchPostComment(
        newRow.comment as string,
        props.account.id,
        props.cycleId,
      )
        .then((response) => {
          const newId = 'id' in response ? response.id : 0;
          const newUpdatedRow = { ...updatedRow, id: newId };
          console.log(response);
          setRows(
            rows.map((row) => (row.id === newRow.id ? newUpdatedRow : row)),
          );
        })
        .catch((e) => console.error(e));
      setFlagNewComment(false);
    } else {
      fetchPutComment(newRow.comment as string, newRow.id as number)
        .then()
        .catch((e) => console.error(e));
    }
  };

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
