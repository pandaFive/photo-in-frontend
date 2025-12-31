'use client';

import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import AreaCard from '@/src/components/AreaCard';
import AreaDialog from '@/src/components/AreaDialog';
import { useToast } from '@/src/context/ToastContext';
import { httpClient } from '@/src/infra/http';
import { useAreaMutation } from '@/src/mutations';
import { Area } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * エリアデータのフェッチャー
 */
const fetcher = async (): Promise<Area[]> => {
  const result = await httpClient.get<Area[]>('/api/areas');
  if (!result.ok) {
    logError('[AreasPage:fetcher]', result.error);
    throw new Error(result.error.message);
  }
  return result.value;
};

const AreasPage = () => {
  const { data: areas, error, isLoading, mutate } = useSWR<Area[], Error>('areas', fetcher);
  const { createArea, updateArea, deleteArea } = useAreaMutation();
  const { showSuccess, showErrorWithRetry } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 検索フィルタリング
  const filteredAreas = useMemo(() => {
    if (!areas) return [];
    if (!searchQuery.trim()) return areas;
    const query = searchQuery.toLowerCase();
    return areas.filter((area) => area.name.toLowerCase().includes(query));
  }, [areas, searchQuery]);

  // ダイアログを開く（新規作成）
  const handleOpenCreate = useCallback(() => {
    setEditingArea(null);
    setDialogOpen(true);
  }, []);

  // ダイアログを開く（編集）
  const handleOpenEdit = useCallback((area: Area) => {
    setEditingArea(area);
    setDialogOpen(true);
  }, []);

  // ダイアログを閉じる
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingArea(null);
  }, []);

  // 保存処理（作成または更新）
  const handleSave = useCallback(
    async (name: string) => {
      setIsSubmitting(true);
      try {
        if (editingArea) {
          // 更新
          const result = await updateArea(editingArea.id, name);
          if (result.success) {
            showSuccess('エリアを更新しました');
            handleCloseDialog();
            void mutate();
          } else {
            showErrorWithRetry(result.error, () => void handleSave(name));
          }
        } else {
          // 作成
          const result = await createArea(name);
          if (result.success) {
            showSuccess('エリアを作成しました');
            handleCloseDialog();
            void mutate();
          } else {
            showErrorWithRetry(result.error, () => void handleSave(name));
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingArea, createArea, updateArea, showSuccess, showErrorWithRetry, handleCloseDialog, mutate],
  );

  // 削除処理
  const handleDelete = useCallback(
    async (id: number) => {
      if (deletingId !== null) return;
      setDeletingId(id);
      try {
        const result = await deleteArea(id);
        if (result.success) {
          showSuccess('エリアを削除しました');
          void mutate();
        } else {
          showErrorWithRetry(result.error, () => void handleDelete(id));
        }
      } finally {
        setDeletingId(null);
      }
    },
    [deleteArea, showSuccess, showErrorWithRetry, mutate, deletingId],
  );

  const areaCount = areas?.length ?? 0;

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
      }}
    >
      <Toolbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ページヘッダー */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: '#667eea',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                }}
              >
                <PlaceIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                  エリア管理
                </Typography>
                <Typography sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  {isLoading
                    ? '読み込み中...'
                    : `${areaCount}件のエリアが登録されています`}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleOpenCreate}
              size="large"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
              variant="contained"
            >
              エリア追加
            </Button>
          </Box>
        </Paper>

        {/* 検索バー */}
        <Box sx={{ mb: 3 }}>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="エリア名で検索..."
            size="small"
            sx={{
              width: { xs: '100%', sm: 320 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 2,
              },
            }}
            value={searchQuery}
          />
          {searchQuery && (
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              {filteredAreas.length}件の結果
            </Typography>
          )}
        </Box>

        {/* ローディング状態 */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
            }}
          >
            <CircularProgress size={48} />
          </Box>
        )}

        {/* エラー状態 */}
        {error && !isLoading && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography color="text.secondary" variant="h6">
              エリアの読み込みに失敗しました
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              {error instanceof Error ? error.message : '不明なエラーが発生しました'}
            </Typography>
            <Button
              onClick={() => void mutate()}
              sx={{ mt: 2 }}
              variant="contained"
            >
              再試行
            </Button>
          </Paper>
        )}

        {/* エリアカードグリッド */}
        {!isLoading && !error && filteredAreas.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {filteredAreas.map((area) => (
              <AreaCard
                area={area}
                isDeleting={deletingId === area.id}
                key={area.id}
                onDelete={(id) => void handleDelete(id)}
                onEdit={handleOpenEdit}
              />
            ))}
          </Box>
        )}

        {/* 空状態 */}
        {!isLoading && !error && filteredAreas.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <PlaceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary" variant="h6">
              {searchQuery
                ? '検索条件に一致するエリアが見つかりません'
                : 'エリアがまだ登録されていません'}
            </Typography>
            {!searchQuery && (
              <Button
                onClick={handleOpenCreate}
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                variant="contained"
              >
                最初のエリアを追加
              </Button>
            )}
          </Paper>
        )}
      </Container>

      {/* 作成・編集ダイアログ */}
      <AreaDialog
        editingArea={editingArea}
        isSubmitting={isSubmitting}
        onClose={handleCloseDialog}
        onSave={handleSave}
        open={dialogOpen}
      />
    </Box>
  );
};

export default AreasPage;
