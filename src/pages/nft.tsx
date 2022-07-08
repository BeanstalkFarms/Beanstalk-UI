import React, { useState } from 'react';
import {
  Button,
  Card,
  Container, Divider, Grid,
  Stack, Tab, Tabs, Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useAccount } from 'wagmi';
import { BeanstalkPalette } from '../components/App/muiTheme';
import NFTDetails from '../components/NFT/NFTDetails';
import NFTDialog from '../components/NFT/NFTDialog';
import WalletCard from '../components/NFT/WalletCard';

const NFTPage: React.FC = () => {
  const { data: account } = useAccount();

  // local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);

  // handlers
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleDialogOpen = (index: number) => {
    // TODO: set which NFT was selected
    setDialogOpen(true);
  };

  const handleDialogClose = (index: number) => {
    // TODO: set which NFT was selected
    setDialogOpen(false);
  };

  if (account?.address === undefined) {
    return null;
  }

  return (
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
          <Stack gap={1}>
            <Typography variant="h2">My BeaNFTs</Typography>
            <WalletCard address={account.address} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
              <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
                <Tab label={`Genesis (${12})`} />
                <Tab label={`Winter (${3})`} />
              </Tabs>
              <Button>Mint All Genesis</Button>
            </Stack>
            <Divider />
            <Grid container spacing={3} sx={{ px: 3 }}>
              {new Array(6).fill(null).map((_, i) => (
                <Grid item md={4} xs={12}>
                  <Card
                    onClick={() => handleDialogOpen(i)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: BeanstalkPalette.hoverBlue,
                        opacity: 0.95
                      }
                  }}>
                    <NFTDetails />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Card>
      </Stack>
      <NFTDialog dialogOpen={dialogOpen} handleDialogClose={handleDialogClose} address={account.address} />
    </Container>
  );
};

export default NFTPage;
