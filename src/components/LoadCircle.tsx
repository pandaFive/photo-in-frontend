import { Box, CircularProgress } from '@mui/material';

const LoadCircle = () => {
  return (
    <Box
      alignItems={'center'}
      display={'flex'}
      justifyContent={'center'}
      sx={{ width: '90%', margin: 2 }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadCircle;
