'use client';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import PlaceIcon from '@mui/icons-material/Place';
import { Avatar, Box, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

import { Area } from '@/src/types';

type Props = {
  area: Area;
  onEdit: (area: Area) => void;
  onDelete: (id: number) => void;
};

/**
 * エリアカードコンポーネント
 * エリア名と編集・削除ボタンを表示
 */
const AreaCard = ({ area, onEdit, onDelete }: Props) => {
  const handleDelete = () => {
    if (confirm(`${area.name}を削除しますか？`)) {
      onDelete(area.id);
    }
  };

  return (
    <Card
      sx={{
        m: 1,
        width: '100%',
        maxWidth: 300,
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* ヘッダー部分 */}
      <Box
        sx={{
          bgcolor: '#667eea',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          <PlaceIcon sx={{ color: 'white' }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {area.name}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="編集">
            <IconButton
              aria-label="編集"
              onClick={() => onEdit(area)}
              size="small"
              sx={{
                color: '#667eea',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              aria-label="削除"
              onClick={handleDelete}
              size="small"
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default memo(AreaCard);
