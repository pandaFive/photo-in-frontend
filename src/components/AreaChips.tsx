import { Box, Chip, Grid, Paper, Typography } from '@mui/material';

type Props = {
  areaNames: string[];
};

const AreaChips = (props: Props) => {
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
        <Box display={'flex'} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {props.areaNames?.map((name) => {
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
      </Paper>
    </Grid>
  );
};

export default AreaChips;
