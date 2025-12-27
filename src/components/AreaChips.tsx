import { Alert, Box, Chip, Grid, Paper, Typography } from '@mui/material';

type Props = {
  areaNames: string[];
  error?: boolean;
};

const AreaChips = ({ areaNames, error = false }: Props) => {
  return (
    <Grid>
      <Paper
        elevation={2}
        square={false}
        sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="h6" whiteSpace={'nowrap'}>
          現在登録されているエリア：
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ ml: 2, flex: 1 }}>
            エリア情報の取得に失敗しました
          </Alert>
        ) : (
          <Box display={'flex'} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {areaNames?.map((name) => {
              return (
                <Chip
                  color="primary"
                  key={name}
                  label={name}
                  sx={{ ml: 1, p: 0, height: '1.6rem' }}
                  variant="outlined"
                />
              );
            })}
          </Box>
        )}
      </Paper>
    </Grid>
  );
};

export default AreaChips;
