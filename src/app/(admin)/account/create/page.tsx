'use client';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import AreaListCheck from '@/src/components/AreaListCheck';
import RoleRadioButton from '@/src/components/RoleRadioButton';
import { singUpAction } from '@/src/util/actions/signUp';
import { logError } from '@/src/util/safe-logger';

const AccountCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);

    // バリデーション
    const name = data.get('name');
    const password = data.get('password');
    const capacity = data.get('capacity');

    if (!name || typeof name !== 'string' || name.trim() === '') {
      setError('アカウント名を入力してください');
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    if (!capacity || Number(capacity) <= 0) {
      setError('キャパシティは1以上を入力してください');
      return;
    }

    // FormDataから全てのチェックボックスの値を取得（React的な方法）
    const checkedValues = data.getAll('option').filter((value) => value !== '');

    if (checkedValues.length === 0) {
      setError('少なくとも1つのエリアを選択してください');
      return;
    }

    data.append('area', JSON.stringify(checkedValues));

    setIsSubmitting(true);
    try {
      // ERR-004: サーバーアクションからのエラーを処理
      const result = await singUpAction(data);
      if (!result.success) {
        setError(result.error || 'アカウント作成に失敗しました');
      }
      // 成功時はサーバーアクション内でリダイレクトされる
    } catch (err) {
      setError('アカウント作成に失敗しました');
      logError('[AccountCreate] handleSubmit', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
      }}
    >
      <Toolbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
              }}
            >
              <PersonAddIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                新規アカウント作成
              </Typography>
              <Typography sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                撮影者の情報を入力してください
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* フォーム */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Box
            component="form"
            noValidate
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            {/* アカウント名 */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                アカウント名
              </Typography>
              <TextField
                autoComplete="text"
                autoFocus
                fullWidth
                id="name"
                name="name"
                placeholder="例: 山田太郎"
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* パスワード */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                パスワード
              </Typography>
              <TextField
                autoComplete="new-password"
                fullWidth
                helperText="8文字以上で入力してください"
                id="password"
                name="password"
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                type="password"
              />
            </Box>

            {/* キャパシティ */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                1日あたりのキャパシティ
              </Typography>
              <TextField
                defaultValue={1}
                fullWidth
                helperText="1日に対応可能な撮影件数"
                inputProps={{ min: 1 }}
                name="capacity"
                required
                size="small"
                sx={{
                  maxWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                type="number"
              />
            </Box>

            {/* 撮影可能エリア */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                撮影可能エリア
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f5f7fa',
                  borderRadius: 2,
                }}
              >
                <AreaListCheck />
              </Box>
            </Box>

            {/* Role */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                権限
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f5f7fa',
                  borderRadius: 2,
                }}
              >
                <RoleRadioButton />
              </Box>
            </Box>

            {/* 送信ボタン */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                disabled={isSubmitting}
                size="large"
                startIcon={<PersonAddIcon />}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#667eea',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#5a6fd6',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(102, 126, 234, 0.5)',
                    color: 'white',
                  },
                }}
                type="submit"
                variant="contained"
              >
                {isSubmitting ? '作成中...' : 'アカウントを作成'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccountCreate;
