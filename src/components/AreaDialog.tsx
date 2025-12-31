'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { Area } from '@/src/types';

/** エリア名の最大文字数 */
const MAX_NAME_LENGTH = 32;

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  editingArea: Area | null;
  isSubmitting: boolean;
};

/**
 * エリア作成・編集ダイアログ
 * editingAreaがnullの場合は新規作成モード
 */
const AreaDialog = ({ open, onClose, onSave, editingArea, isSubmitting }: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditMode = editingArea !== null;

  // ダイアログが開いたとき、または編集対象が変わったときに初期化
  useEffect(() => {
    if (open) {
      setName(editingArea?.name ?? '');
      setError(null);
    }
  }, [open, editingArea]);

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'エリア名は必須です';
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return 'エリア名は32文字以内で入力してください';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    await onSave(name.trim());
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      aria-labelledby="area-dialog-title"
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle id="area-dialog-title" sx={{ fontWeight: 700 }}>
        {isEditMode ? 'エリア編集' : 'エリア追加'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          disabled={isSubmitting}
          error={!!error}
          fullWidth
          helperText={error}
          inputProps={{ maxLength: MAX_NAME_LENGTH + 1 }}
          label="エリア名"
          margin="dense"
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          required
          value={name}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          disabled={isSubmitting}
          onClick={handleClose}
          sx={{
            borderRadius: 2,
            color: '#667eea',
          }}
        >
          キャンセル
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          sx={{
            borderRadius: 2,
            bgcolor: '#667eea',
            color: 'white',
            px: 3,
            '&:hover': {
              bgcolor: '#5a6fd6',
            },
          }}
          variant="contained"
        >
          {isSubmitting
            ? isEditMode
              ? '更新中...'
              : '追加中...'
            : isEditMode
              ? '更新'
              : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaDialog;
