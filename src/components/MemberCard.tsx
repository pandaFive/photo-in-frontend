import {
  Button,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

import CircleRate from '@/src/components/CircleRate';
import { MemberStatus } from '@/src/types';
import { formatIsoToYYYYMMDD } from '@/src/util/format-date';

type Props = {
  member: MemberStatus;
  handleDelete: (id: number) => void;
};

const MemberCard = (props: Props) => {
  const onDelete = async () => {
    if (!confirm(`${props.member.name}を削除しますか？`)) {
      return;
    }

    try {
      await fetch(`/api/account/${props.member.id}`, {
        method: 'DELETE',
      });
      props.handleDelete(props.member.id);
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

  return (
    <Grid sx={{ m: 1 }} width={'95%'}>
      <Paper elevation={2} square={false}>
        <Card>
          <CardHeader
            subheader={`最終更新：${formatIsoToYYYYMMDD(props.member.updatedAt)}`}
            title={`${props.member.name}`}
          />
          <Divider variant="middle" />
          <CardContent>
            <Box alignItems={'center'} display={'flex'}>
              <Typography>撮影可能エリア：</Typography>
              {props.member.area.map((areaStatus) => (
                <Chip
                  color="primary"
                  key={areaStatus}
                  label={areaStatus}
                  sx={{ ml: 1, p: 0, height: '1.6rem' }}
                  variant="outlined"
                />
              ))}
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-around',
                my: 2,
              }}
            >
              <Box sx={{ width: '20%' }}>
                <Typography>
                  登録日：{formatIsoToYYYYMMDD(props.member.createdAt)}
                </Typography>
                <Typography>
                  1日の最大撮影数：{props.member.capacity}
                </Typography>
                <Typography>総撮影件数：{props.member.total}</Typography>
                <Typography>現在のアサイン数：{props.member.assign}</Typography>
              </Box>
              <Box sx={{ width: '20%' }}>
                <CircleRate
                  name="NG率"
                  rate={props.member.ng_rate * 100}
                  size={120}
                />
              </Box>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              onClick={() => {
                void onDelete();
              }}
              size="small"
              variant="outlined"
            >
              削除
            </Button>
          </CardActions>
        </Card>
      </Paper>
    </Grid>
  );
};

export default MemberCard;
