'use client';
import { Title } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

import { getAccountStatus } from '../api/get-account-status';
import { MemberStatus } from '../types';

const Orders = () => {
  const [rows, setRow] = React.useState<MemberStatus[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await getAccountStatus();

      if (response !== undefined) {
        setRow(response as MemberStatus[]);
      }
    };
    void fetchData();
  }, []);

  return (
    <React.Fragment>
      <Title>Recent Orders</Title>
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
          {rows?.map((row) => (
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
    </React.Fragment>
  );
};

export default Orders;
