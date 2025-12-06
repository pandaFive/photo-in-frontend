'use client';

import {
  Box,
  Button,
  Container,
  TextField,
  Input,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import AreaListCheck from '@/src/components/AreaListCheck';
import RoleRadioButton from '@/src/components/RoleRadioButton';
import { singUpAction } from '@/src/util/actions/signUp';

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
      await singUpAction(data);
    } catch (err) {
      setError('アカウント作成に失敗しました');
      console.error('Account creation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box
        component="main"
        sx={{ backgroundColor: '#f9f9f9', flexGrow: 1, overflow: 'auto' }}
      >
        <Toolbar />
        <Container
          maxWidth="xl"
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4">Create New Account</Typography>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
          >
            <Box
              alignItems={'center'}
              display={'flex'}
              sx={{ backgroundColor: 'background.paper', mb: 1 }}
            >
              <Typography sx={{ m: 2, width: '15%' }}>Account name</Typography>
              <TextField
                aria-label="Account Name"
                autoComplete="text"
                autoFocus
                id="name"
                label="Account Name"
                margin="normal"
                name="name"
                required
                size="small"
                sx={{ width: '20%' }}
              />
            </Box>
            <Box
              alignItems={'center'}
              display={'flex'}
              sx={{ backgroundColor: 'background.paper', mb: 1 }}
            >
              <Typography sx={{ m: 2, width: '15%' }}>password</Typography>
              <TextField
                aria-label="password"
                autoComplete="password"
                autoFocus
                id="password"
                label="password"
                margin="normal"
                name="password"
                required
                size="small"
                sx={{ width: '20%' }}
                type="password"
              />
            </Box>
            <Box
              alignItems={'center'}
              display={'flex'}
              sx={{ backgroundColor: 'background.paper', mb: 1 }}
            >
              <Typography sx={{ m: 2, width: '15%' }}>
                1日当たりのキャパシティ
              </Typography>
              <Input
                defaultValue={0}
                name="capacity"
                required
                size="small"
                type="number"
              />
            </Box>
            <Box
              alignItems={'center'}
              display={'flex'}
              sx={{ backgroundColor: 'background.paper', mb: 1 }}
            >
              <Typography sx={{ m: 2, width: '15%' }}>
                撮影可能エリア
              </Typography>
              <AreaListCheck />
            </Box>
            <Box
              alignItems={'center'}
              display={'flex'}
              sx={{ backgroundColor: 'background.paper', mb: 1 }}
            >
              <Typography sx={{ m: 2, width: '15%' }}>Role</Typography>
              <RoleRadioButton />
            </Box>
            <Button
              disabled={isSubmitting}
              size="medium"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              variant="contained"
            >
              {isSubmitting ? '作成中...' : '新規作成'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AccountCreate;
