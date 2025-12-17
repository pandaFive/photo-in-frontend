'use client';

import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { useToast } from '@/src/context/ToastContext';
import { parseIsoToYYYYMMDD } from '@/src/domain/functions/date';
import { useAccountMutation } from '@/src/mutations';
import { MemberStatus } from '@/src/types';

type Props = {
  member: MemberStatus;
  handleDelete: (id: number) => void;
};

// NG率に応じた色を返す
const getNgRateColor = (rate: number): 'success' | 'warning' | 'error' => {
  if (rate < 0.1) return 'success';
  if (rate < 0.3) return 'warning';
  return 'error';
};

// 名前からイニシャルを取得
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// 統計アイテムコンポーネント
const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography fontWeight={600} variant="body2">
        {value}
      </Typography>
    </Box>
  </Box>
);

const MemberCard = (props: Props) => {
  const { deleteAccount } = useAccountMutation();
  const { showSuccess, showErrorWithRetry } = useToast();
  const ngRatePercent = props.member.ng_rate * 100;
  const ngRateColor = getNgRateColor(props.member.ng_rate);

  const onDelete = async () => {
    if (!confirm(`${props.member.name}を削除しますか？`)) {
      return;
    }

    const result = await deleteAccount(props.member.id);
    if (result.success) {
      props.handleDelete(props.member.id);
      showSuccess('メンバーを削除しました');
    } else {
      console.error('Failed to delete member:', result.error);
      showErrorWithRetry(
        result.error ?? 'メンバーの削除に失敗しました',
        () => void onDelete(),
      );
    }
  };

  return (
    <Card
      sx={{
        m: 1,
        width: '100%',
        maxWidth: 400,
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
          p: 2.5,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {getInitials(props.member.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {props.member.name}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 14 }} />
              登録: {parseIsoToYYYYMMDD(props.member.createdAt)}
            </Typography>
          </Box>
          <Tooltip title="メンバーを削除">
            <IconButton
              onClick={() => void onDelete()}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* エリアチップ */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            撮影可能エリア
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {props.member.area.length > 0 ? (
              props.member.area.map((areaStatus) => (
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  key={areaStatus}
                  label={areaStatus}
                  size="small"
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: 'primary.main' },
                  }}
                />
              ))
            ) : (
              <Typography color="text.disabled" variant="body2">
                未設定
              </Typography>
            )}
          </Stack>
        </Box>

        {/* 統計グリッド */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mb: 2.5,
          }}
        >
          <StatItem
            icon={<SpeedIcon fontSize="small" />}
            label="1日の最大撮影数"
            value={props.member.capacity}
          />
          <StatItem
            icon={<CameraAltIcon fontSize="small" />}
            label="総撮影件数"
            value={props.member.total}
          />
          <StatItem
            icon={<AssignmentIcon fontSize="small" />}
            label="現在のアサイン"
            value={props.member.assign}
          />
          <StatItem
            icon={<CalendarTodayIcon fontSize="small" />}
            label="最終更新"
            value={parseIsoToYYYYMMDD(props.member.updatedAt)}
          />
        </Box>

        {/* NG率プログレスバー */}
        <Box
          sx={{
            bgcolor: 'grey.50',
            borderRadius: 2,
            p: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography color="text.secondary" variant="caption">
              NG率
            </Typography>
            <Typography
              color={`${ngRateColor}.main`}
              fontWeight={700}
              variant="caption"
            >
              {ngRatePercent.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            color={ngRateColor}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
            }}
            value={ngRatePercent}
            variant="determinate"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
