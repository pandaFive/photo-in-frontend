import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Link from 'next/link';
import React from 'react';

import Title from '@/src/components/Title';
import { MemberStatus } from '@/src/types';

type Props = {
  members: MemberStatus[];
  error?: boolean;
};

const Orders = ({ members, error = false }: Props) => {
  return (
    <React.Fragment>
      <Title>Recent Orders</Title>
      {error ? (
        <Alert
          action={
            <Button
              color="inherit"
              component={Link}
              href="/dashboard"
              size="small"
              startIcon={<RefreshIcon />}
            >
              再読み込み
            </Button>
          }
          severity="error"
          sx={{ mt: 1 }}
        >
          メンバー情報の取得に失敗しました。
        </Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>エリア</TableCell>
              <TableCell>総計</TableCell>
              <TableCell>週間総計</TableCell>
              <TableCell>NG率</TableCell>
              <TableCell>現在アサイン</TableCell>
              <TableCell align="right">遂行総計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.area.join(' ')}</TableCell>
                <TableCell>{row.total}</TableCell>
                <TableCell>{row.week}</TableCell>
                <TableCell>{row.ng_rate}</TableCell>
                <TableCell>{row.assign}</TableCell>
                <TableCell align="right">{`${row.total}件`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </React.Fragment>
  );
};

export default Orders;
