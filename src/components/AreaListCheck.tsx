'use client';

import { Checkbox, FormControlLabel, FormGroup, List } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { getAreas } from '../api/get-areas';
import { Area } from '../types';

const AreaListCheck = () => {
  const [checked, setChecked] = useState([0]);
  const [area, setArea] = useState<Area[]>([]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const getArea = useCallback(async () => {
    try {
      const res = (await getAreas()) as Area[];
      setArea(res);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onFetchArea = useCallback(() => {
    getArea()
      .then()
      .catch((e) => console.error(e));
  }, [getArea]);

  useEffect(() => {
    onFetchArea();
  }, [onFetchArea]);

  return (
    <List sx={{ width: '100%', maxWidth: 700, bgcolor: 'background.paper' }}>
      <FormGroup
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          flexBasis: 'calc(33.333% - 10px)',
        }}
      >
        {area.map((value) => {
          return (
            <FormControlLabel
              control={<Checkbox name="option" value={value.id} />}
              key={value.name}
              label={value.name}
              onClick={handleToggle(value.id)}
              sx={{ flex: '1 1 calc(33.333% - 10px)' }}
            />
          );
        })}
      </FormGroup>
    </List>
  );
};

export default AreaListCheck;
