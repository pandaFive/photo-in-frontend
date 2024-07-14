'use client';

import AddIcon from '@mui/icons-material/Add';
import { Box, Container, Fab, Link, Toolbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { getAccountStatus } from '@/src/api/get-account-status';
import MemberCard from '@/src/components/MemberCard';
import { MemberStatus } from '@/src/types';

const Members = () => {
  const [membersStatus, setMembersStatus] = useState<MemberStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAccountStatus();

      if (response !== undefined) {
        setMembersStatus(response as MemberStatus[]);
      }
    };

    void fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setMembersStatus(membersStatus.filter((member) => member.id !== id));
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box
        component="main"
        sx={{ backgroundColor: '#f9f9f9', flexGrow: 1, overflow: 'auto' }}
      >
        <Toolbar />
        <Container
          maxWidth="xl"
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Box alignItems={'center'} display={'flex'}>
            <Typography variant="h5">
              現在の撮影者数：{membersStatus.length}
            </Typography>
            <Link href="/account/create">
              <Fab
                color="primary"
                size="small"
                sx={{ ml: 1 }}
                variant="extended"
              >
                <AddIcon />
                撮影者を追加する
              </Fab>
            </Link>
          </Box>
          {membersStatus?.map((memberStatus) => (
            <MemberCard
              handleDelete={handleDelete}
              key={memberStatus.id}
              member={memberStatus}
            />
          ))}
        </Container>
      </Box>
    </Box>
  );
};

export default Members;
