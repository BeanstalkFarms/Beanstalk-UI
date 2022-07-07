import React from 'react';
import {
  Card,
  Container,
  Stack, Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';

const NFTPage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack spacing={2}>
      <PageHeader
        title={
          <>
            <strong>BeaNFTs</strong>
          </>
          }
        description="View and mint your BeaNFTs"
        />
      <Card sx={{ p: 2 }}>
        <Typography>Content goes here!</Typography>
      </Card>
    </Stack>
  </Container>
  );

export default NFTPage;
