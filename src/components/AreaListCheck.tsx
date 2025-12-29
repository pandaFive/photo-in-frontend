'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  List,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/src/context/ToastContext';
import { getExceptionMessage } from '@/src/domain/types/error';
import { logError } from '@/src/util/safe-logger';

import { getAreas } from '../api/get-areas';
import { Area, isErrorResponse } from '../types';

const AreaListCheck = () => {
  const [checked, setChecked] = useState([0]);
  const [area, setArea] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showError } = useToast();

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
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAreas();
      if (isErrorResponse(res)) {
        logError('[AreaListCheck:getArea]', res.errors);
        setError('エリア一覧の取得に失敗しました。');
        showError('エリア一覧の取得に失敗しました。');
        return;
      }
      setArea(res);
    } catch (err) {
      logError('[AreaListCheck:getArea]', err);
      const message = getExceptionMessage(err, 'エリア一覧の取得に失敗しました。');
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const onFetchArea = useCallback(() => {
    void getArea();
  }, [getArea]);

  useEffect(() => {
    onFetchArea();
  }, [onFetchArea]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        action={
          <Button
            color="inherit"
            onClick={onFetchArea}
            size="small"
            startIcon={<RefreshIcon />}
          >
            再試行
          </Button>
        }
        icon={<ErrorOutlineIcon />}
        severity="error"
        sx={{ borderRadius: 2 }}
      >
        {error}
      </Alert>
    );
  }

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
