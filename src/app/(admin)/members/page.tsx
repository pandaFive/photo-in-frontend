'use client';

import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GroupIcon from '@mui/icons-material/Group';
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
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import MemberCard from '@/src/components/MemberCard';
import MemberEditDialog from '@/src/components/MemberEditDialog';
import { useToast } from '@/src/context/ToastContext';
import { httpClient } from '@/src/infra/http';
import { useAccountMutation } from '@/src/mutations';
import { Area, MemberStatus } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * メンバーデータのフェッチャー
 */
const membersFetcher = async (): Promise<MemberStatus[]> => {
  const result = await httpClient.get<MemberStatus[]>('/api/accounts');
  if (!result.ok) {
    logError('[MembersPage:membersFetcher]', result.error);
    throw new Error(result.error.message);
  }
  return result.value;
};

/**
 * エリアデータのフェッチャー
 */
const areasFetcher = async (): Promise<Area[]> => {
  const result = await httpClient.get<Area[]>('/api/areas');
  if (!result.ok) {
    logError('[MembersPage:areasFetcher]', result.error);
    throw new Error(result.error.message);
  }
  return result.value;
};

const Members = () => {
  const {
    data: members,
    error: membersError,
    isLoading: membersLoading,
    mutate,
  } = useSWR<MemberStatus[], Error>('members', membersFetcher);
  const { data: areas, error: areasError, isLoading: areasLoading } = useSWR<Area[], Error>('areas', areasFetcher);

  const { updateAccount } = useAccountMutation();
  const { showSuccess, showError, showErrorWithRetry } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = membersLoading || areasLoading;

  // 検索フィルタリング
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.area.some((area) => area.toLowerCase().includes(query)),
    );
  }, [members, searchQuery]);

  // 削除ハンドラー（ローカルの楽観的更新）
  const handleDelete = useCallback(
    (id: number) => {
      void mutate(
        (current) => current?.filter((member) => member.id !== id),
        false,
      );
    },
    [mutate],
  );

  // 編集ダイアログを開く
  const handleOpenEdit = useCallback((member: MemberStatus) => {
    if (areasError) {
      showError('エリア情報の読み込みに失敗したため、編集できません');
      return;
    }
    setEditingMember(member);
    setDialogOpen(true);
  }, [areasError, showError]);

  // ダイアログを閉じる
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingMember(null);
  }, []);

  // 保存処理
  const handleSave = useCallback(
    async (name: string, areaIds: number[], capacity: number) => {
      if (!editingMember) return;

      setIsSubmitting(true);
      try {
        const result = await updateAccount(editingMember.id, name, areaIds, capacity);
        if (result.success) {
          showSuccess('メンバーを更新しました');
          handleCloseDialog();
          void mutate();
        } else {
          showErrorWithRetry(result.error ?? '更新に失敗しました', () =>
            void handleSave(name, areaIds, capacity),
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingMember, updateAccount, showSuccess, showErrorWithRetry, handleCloseDialog, mutate],
  );

  const memberCount = members?.length ?? 0;

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
                <GroupIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                  撮影者管理
                </Typography>
                <Typography sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  {isLoading ? '読み込み中...' : `${memberCount}名の撮影者が登録されています`}
                </Typography>
              </Box>
            </Box>
            <Link href="/account/create" style={{ textDecoration: 'none' }}>
              <Button
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
                撮影者を追加
              </Button>
            </Link>
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
            placeholder="名前またはエリアで検索..."
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
              {filteredMembers.length}件の結果
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
        {membersError && !isLoading && (
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
              撮影者の読み込みに失敗しました
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              {membersError instanceof Error ? membersError.message : '不明なエラーが発生しました'}
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

        {/* メンバーカードグリッド */}
        {!isLoading && !membersError && filteredMembers.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {filteredMembers.map((memberStatus) => (
              <MemberCard
                handleDelete={handleDelete}
                key={memberStatus.id}
                member={memberStatus}
                onEdit={handleOpenEdit}
              />
            ))}
          </Box>
        )}

        {/* 検索結果なし / 空状態 */}
        {!isLoading && !membersError && filteredMembers.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary" variant="h6">
              {searchQuery
                ? '検索条件に一致する撮影者が見つかりません'
                : '撮影者がまだ登録されていません'}
            </Typography>
            {!searchQuery && (
              <Link href="/account/create" style={{ textDecoration: 'none' }}>
                <Button
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  variant="contained"
                >
                  最初の撮影者を追加
                </Button>
              </Link>
            )}
          </Paper>
        )}
      </Container>

      {/* 編集ダイアログ */}
      <MemberEditDialog
        areas={areas ?? []}
        editingMember={editingMember}
        isSubmitting={isSubmitting}
        onClose={handleCloseDialog}
        onSave={handleSave}
        open={dialogOpen}
      />
    </Box>
  );
};

export default Members;
