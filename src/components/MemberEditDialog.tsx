'use client';

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { MAX_CAPACITY, MAX_NAME_LENGTH } from '@/src/domain/constants/account';
import { Area, MemberStatus } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, areaIds: number[], capacity: number) => Promise<void>;
  editingMember: MemberStatus | null;
  isSubmitting: boolean;
  areas: Area[];
};

type FormErrors = {
  name: string | null;
  capacity: string | null;
};

/**
 * メンバー編集ダイアログ
 */
const MemberEditDialog = ({
  open,
  onClose,
  onSave,
  editingMember,
  isSubmitting,
  areas,
}: Props) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({ name: null, capacity: null });

  // 初期化: ダイアログが開いたときに編集対象のデータをセット
  useEffect(() => {
    if (open && editingMember) {
      setName(editingMember.name);
      setCapacity(editingMember.capacity);
      // メンバーのエリア名からエリアIDに変換
      const matchedAreas = areas.filter((area) => editingMember.area.includes(area.name));
      const areaIds = matchedAreas.map((area) => area.id);

      // マッピングできなかったエリア名がある場合は警告ログを出力
      const mappedNames = matchedAreas.map((area) => area.name);
      const unmappedAreas = editingMember.area.filter((name) => !mappedNames.includes(name));
      if (unmappedAreas.length > 0) {
        logError('[MemberEditDialog] エリア名のマッピングに失敗', {
          memberId: editingMember.id,
          memberName: editingMember.name,
          unmappedAreas,
        });
      }

      setSelectedAreaIds(areaIds);
      setErrors({ name: null, capacity: null });
    }
  }, [open, editingMember, areas]);

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '名前は必須です';
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return '名前は32文字以内で入力してください';
    }
    return null;
  };

  const validateCapacity = (value: number): string | null => {
    if (value < 0 || !Number.isInteger(value) || value > MAX_CAPACITY) {
      return `1日の最大撮影数は0以上${MAX_CAPACITY}以下の整数で入力してください`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const nameError = validateName(name);
    const capacityError = validateCapacity(capacity);

    if (nameError || capacityError) {
      setErrors({ name: nameError, capacity: capacityError });
      return;
    }

    try {
      await onSave(name.trim(), selectedAreaIds, capacity);
    } catch (error) {
      logError('[MemberEditDialog:handleSubmit] onSave threw', error);
      throw error; // 親のcatchで処理させる
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleAreaToggle = (areaId: number) => {
    setSelectedAreaIds((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId);
      }
      return [...prev, areaId];
    });
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 空の場合は0にリセット
    if (rawValue === '') {
      setCapacity(0);
      setErrors((prev) => ({ ...prev, capacity: null }));
      return;
    }

    // 小数点を含む場合はエラー表示（parseIntの黙示的切り捨てを防止）
    if (rawValue.includes('.')) {
      setCapacity(0);
      setErrors((prev) => ({
        ...prev,
        capacity: `1日の最大撮影数は0以上${MAX_CAPACITY}以下の整数で入力してください`,
      }));
      return;
    }

    const value = parseInt(rawValue, 10);
    setCapacity(isNaN(value) ? 0 : value);
    setErrors((prev) => ({ ...prev, capacity: null }));
  };

  return (
    <Dialog
      aria-labelledby="member-edit-dialog-title"
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
      <DialogTitle id="member-edit-dialog-title" sx={{ fontWeight: 700 }}>
        メンバー編集
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          disabled={isSubmitting}
          error={!!errors.name}
          fullWidth
          helperText={errors.name}
          inputProps={{ maxLength: MAX_NAME_LENGTH + 1 }}
          label="名前"
          margin="dense"
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: null }));
          }}
          required
          value={name}
          variant="outlined"
        />

        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography
            color="text.secondary"
            sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1 }}
          >
            撮影可能エリア
          </Typography>
          {areas.length === 0 ? (
            <Typography color="error" sx={{ fontSize: '0.875rem' }}>
              エリア情報を読み込めませんでした。ダイアログを閉じて再試行してください。
            </Typography>
          ) : (
            <FormGroup
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'row',
              }}
            >
              {areas.map((area) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedAreaIds.includes(area.id)}
                      disabled={isSubmitting}
                      onChange={() => handleAreaToggle(area.id)}
                    />
                  }
                  key={area.id}
                  label={area.name}
                  sx={{ flex: '1 1 calc(33.333% - 10px)' }}
                />
              ))}
            </FormGroup>
          )}
        </Box>

        <TextField
          disabled={isSubmitting}
          error={!!errors.capacity}
          fullWidth
          helperText={errors.capacity}
          inputProps={{ min: 0 }}
          label="1日の最大撮影数"
          margin="dense"
          onChange={handleCapacityChange}
          type="number"
          value={capacity}
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
          {isSubmitting ? '更新中...' : '更新'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberEditDialog;
