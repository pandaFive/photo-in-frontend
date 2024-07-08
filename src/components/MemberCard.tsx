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
  TextField,
} from '@mui/material';

import { MemberStatus } from '../types';

import CircleRate from './CircleRate';

type Props = {
  member: MemberStatus;
  handleDelete: (id: number) => void;
};

const transformIsoDateString = (isoString: string) => {
  // ISO 8601形式の日付文字列をDateオブジェクトに変換
  const date = new Date(isoString);

  // 年、月、日を取得
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
  const day = String(date.getDate()).padStart(2, '0');

  // 「年-月-日」形式の文字列を返す
  return `${year}-${month}-${day}`;
};

const MemberCard = (props: Props) => {
  const onDelete = () => {
    const confirmed = confirm(`${props.member.name}を削除しますか？`);

    if (confirmed) {
      const fetchDelete = async () => {
        try {
          await fetch(`/api/account/${props.member.id}`, {
            method: 'DELETE',
          });
          props.handleDelete(props.member.id);
        } catch (err) {
          console.error(err);
        }
      };

      void fetchDelete();
    }
  };

  return (
    <Grid sx={{ m: 1 }} width={'95%'}>
      <Paper elevation={2} square={false}>
        <Card>
          <CardHeader
            subheader={`最終更新：${transformIsoDateString(props.member.updatedAt)}`}
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
                  登録日：{transformIsoDateString(props.member.createdAt)}
                </Typography>
                <Typography>
                  1日の最大撮影数：{props.member.capacity}
                </Typography>
                <Typography>総撮影件数：{props.member.total}</Typography>
                <Typography>現在のアサイン数：{props.member.assign}</Typography>
              </Box>
              <TextField
                label="memo"
                multiline
                rows={5}
                sx={{ width: '50%' }}
              />
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
            <Button size="small" variant="outlined">
              編集
            </Button>
            <Button onClick={onDelete} size="small" variant="outlined">
              削除
            </Button>
          </CardActions>
        </Card>
      </Paper>
    </Grid>
  );
};

export default MemberCard;
