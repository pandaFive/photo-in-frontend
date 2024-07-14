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

import AreaListCheck from '@/src/components/AreaListCheck';
import RoleRadioButton from '@/src/components/RoleRadioButton';
import { singUpAction } from '@/src/util/actions/signUp';

const AccountCreate = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const checkedValues = Array.from(
      document.querySelectorAll('input[name="option"]:checked'),
    ).map((checkbox) => ('value' in checkbox ? checkbox.value : ''));

    const data = new FormData(event.currentTarget);
    data.append('area', JSON.stringify(checkedValues));
    void singUpAction(data);
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
              size="medium"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              variant="contained"
            >
              新規作成
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AccountCreate;
