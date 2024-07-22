'use client';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { loginAction } from '../util/actions/login';

const defaultTheme = createTheme();

const SignInSide = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void loginAction(data);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid component="main" container sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          md={7}
          sm={4}
          sx={{
            backgroundColor: (t) =>
              t.palette.mode === 'light'
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'left',
          }}
          xs={false}
        >
          <Box
            alignItems={'center'}
            display={'flex'}
            flexDirection={'column'}
            height="100%"
            justifyContent={'center'}
            marginTop={2}
          >
            <Typography component="h2" variant="h2">
              PHOTO IN
            </Typography>
            <Typography variant="h4">
              撮影タスクを自動割り振りするアプリケーション
            </Typography>
          </Box>
        </Grid>
        <Grid component={Paper} elevation={6} item md={5} sm={8} square xs={12}>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                autoComplete="text"
                autoFocus
                fullWidth
                id="name"
                label="Account Name"
                margin="normal"
                name="name"
                required
              />
              <TextField
                autoComplete="current-password"
                fullWidth
                id="password"
                label="Password"
                margin="normal"
                name="password"
                required
                type="password"
              />
              {/* <FormControlLabel
                control={<Checkbox color="primary" value="remember" />}
                label="Remember me"
              /> */}
              <Button
                fullWidth
                sx={{ mt: 3, mb: 2 }}
                type="submit"
                variant="contained"
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default SignInSide;
