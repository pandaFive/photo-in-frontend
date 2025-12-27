'use client';

import AddIcon from '@mui/icons-material/Add';
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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAccountStatus } from '@/src/api/get-account-status';
import MemberCard from '@/src/components/MemberCard';
import { MemberStatus } from '@/src/types';

const Members = () => {
  const [membersStatus, setMembersStatus] = useState<MemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await getAccountStatus();

      if (response !== undefined) {
        setMembersStatus(response as MemberStatus[]);
      }
      setIsLoading(false);
    };

    void fetchData();
  }, []);

  const handleDelete = useCallback((id: number) => {
    setMembersStatus((prev) => prev.filter((member) => member.id !== id));
  }, []);

  // 検索フィルタリング
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersStatus;
    const query = searchQuery.toLowerCase();
    return membersStatus.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.area.some((area) => area.toLowerCase().includes(query)),
    );
  }, [membersStatus, searchQuery]);

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
                  {isLoading ? '読み込み中...' : `${membersStatus.length}名の撮影者が登録されています`}
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

        {/* メンバーカードグリッド */}
        {!isLoading && (
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
              />
            ))}
          </Box>
        )}

        {/* 検索結果なし */}
        {!isLoading && filteredMembers.length === 0 && (
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
    </Box>
  );
};

export default Members;
