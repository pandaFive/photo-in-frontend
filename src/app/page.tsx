'use client';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LoginIcon from '@mui/icons-material/Login';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { loginAction } from '../util/actions/login';

const SignInSide = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        bgcolor: '#f5f7fa',
      }}
    >
      {/* 左側: ブランディングエリア */}
      <Box
        sx={{
          flex: '0 0 45%',
          maxWidth: 600,
          bgcolor: '#667eea',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装飾的な円 */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
        />

        {/* ロゴとタイトル */}
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            p: 3,
            mb: 4,
          }}
        >
          <CameraAltIcon sx={{ fontSize: 64, color: 'white' }} />
        </Box>
        <Typography
          sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: { md: '3rem', lg: '3.5rem' },
            letterSpacing: 2,
            mb: 2,
          }}
        >
          PHOTO IN
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.25rem',
            textAlign: 'center',
            maxWidth: 400,
            lineHeight: 1.8,
          }}
        >
          撮影タスクを自動割り振りする
          <br />
          スマートなアプリケーション
        </Typography>

        {/* 特徴リスト */}
        <Box sx={{ mt: 6 }}>
          {['自動タスク割り当て', 'エリア別管理', 'リアルタイム進捗確認'].map(
            (feature) => (
              <Box
                key={feature}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.8)',
                  }}
                />
                <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {feature}
                </Typography>
              </Box>
            ),
          )}
        </Box>
      </Box>

      {/* 右側: ログインフォーム */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* モバイル用ロゴ */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                bgcolor: '#667eea',
                borderRadius: 3,
                p: 2,
                mb: 2,
              }}
            >
              <CameraAltIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.75rem',
                color: '#667eea',
              }}
            >
              PHOTO IN
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  color: '#333',
                  mb: 1,
                }}
              >
                ログイン
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                アカウント情報を入力してください
              </Typography>
            </Box>

            {/* eslint-disable @typescript-eslint/no-misused-promises */}
            <form action={loginAction}>
              {/* eslint-enable @typescript-eslint/no-misused-promises */}
              <TextField
                autoComplete="text"
                autoFocus
                fullWidth
                id="name"
                label="アカウント名"
                margin="normal"
                name="name"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />
              <TextField
                autoComplete="current-password"
                fullWidth
                id="password"
                label="パスワード"
                margin="normal"
                name="password"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
                type="password"
              />
              <Button
                endIcon={<LoginIcon />}
                fullWidth
                sx={{
                  mt: 4,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: '#667eea',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    bgcolor: '#5a6fd6',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  },
                }}
                type="submit"
                variant="contained"
              >
                ログイン
              </Button>
            </form>
          </Paper>

          {/* フッター */}
          <Typography
            sx={{
              mt: 4,
              textAlign: 'center',
              color: 'text.disabled',
              fontSize: '0.875rem',
            }}
          >
            © {new Date().getFullYear()} PHOTO IN. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignInSide;
