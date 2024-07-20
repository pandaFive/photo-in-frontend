import { Chip, Grid, Paper, Typography } from '@mui/material';

import { getAreas } from '../api/get-areas';
import { Area } from '../types';

const AreaChips = async () => {
  const areas: Area[] = (await getAreas()) as Area[];
  return (
    <Grid>
      <Paper
        elevation={2}
        square={false}
        sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="h6">現在登録されているエリア：</Typography>
        {areas?.map((value) => {
          return (
            <Chip
              color="primary"
              key={value.name}
              label={value.name}
              sx={{ ml: 1, p: 0, height: '1.6rem' }}
              variant="outlined"
            />
          );
        })}
      </Paper>
    </Grid>
  );
};

export default AreaChips;
