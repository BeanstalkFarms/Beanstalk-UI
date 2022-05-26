/* eslint-disable */
import React, {useState} from 'react';
import {Box, Card, Container, Grid, Link, Stack, Typography, useMediaQuery} from '@mui/material';
import PageHeader from '../components/v2/Common/PageHeader';
import BalancesToggle from "../components/v2/Balances/BalancesToggle";
import muiTheme from "../components/v2/App/muiTheme";

const BalancesPage: React.FC = () => {

  const [balancesTab, setBalancesTab] = useState("user-balance")
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleSetTab = (tab: string) => {
    setBalancesTab(tab)
  };

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
          purpose="View Beanstalk balances"
          description="View all balances"
        />
        <Card sx={{border: "none", pl: 2, pr: 2, pt: 3, pb: 3}}>
          <BalancesToggle balancesTab={balancesTab} handleSetTab={handleSetTab}/>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Card sx={{p: 2}}>
                <Stack>
                  <Typography>My Total Balance</Typography>
                  <Typography variant="h2">$109,364</Typography>
                </Stack>
                <Grid container direction="row" alignItems="center">
                  <Grid item xs={12} md={3.5}>
                    <Stack gap={0.5} sx={{pl: 1, pr: 1, pt: 5, pb: 5}}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{opacity: 0.6}}>Deposited Tokens</Typography>
                        <Typography>$100,243</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{opacity: 0.6}}>Withdraw Tokens</Typography>
                        <Typography>$10,534</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{opacity: 0.6}}>Claimable Tokens</Typography>
                        <Typography>$4,542</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{opacity: 0.6}}>Circulating Tokens</Typography>
                        <Typography>$1,123.00</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{opacity: 0.6}}>Wrapped Tokens</Typography>
                        <Typography>$1,234</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box display="flex" justifyContent="center">
                      <Typography>GRAPH</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3.5}>
                    <Stack alignItems="center" justifyContent="center" sx={{p: 3, pt: 5, pb: 5}}>
                      <Stack direction="row">
                        <Typography sx={{opacity: 0.6}}>Hover a state to see breakdown</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Grid container direction="row" spacing={1}>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{p: 2, height: "100%"}}>
                    <Stack gap={2}>
                      <Stack>
                        <Typography>My Stalk</Typography>
                        <Stack direction="row">
                          <Typography variant="h2">X</Typography>
                          <Typography variant="h2">109,364</Typography>
                        </Stack>
                      </Stack>
                      <Box display="flex" justifyContent="center">
                        <Typography>GRAPH</Typography>
                      </Box>
                      <Stack gap={0.7}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{opacity: 0.6}}>Active Stalk</Typography>
                          <Typography>$1,123.00</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{opacity: 0.6}}>Grown Stalk</Typography>
                          <Typography>$1,123.00</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{p: 2, height: "100%"}}>
                    <Stack gap={2}>
                      <Stack>
                        <Typography>My Seeds</Typography>
                        <Stack direction="row">
                          <Typography variant="h2">X</Typography>
                          <Typography variant="h2">109,364</Typography>
                        </Stack>
                      </Stack>
                      <Box display="flex" justifyContent="center">
                        <Typography>GRAPH</Typography>
                      </Box>
                      <Stack gap={0.7}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{opacity: 0.6}}>Active Seed</Typography>
                          <Typography>$1,123.00</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{opacity: 0.6}}>Earned Seed</Typography>
                          <Typography>$1,123.00</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{p: 2, height: "100%"}}>
                    <Stack gap={2} justifyContent="space-between" height="100%">
                      <Stack>
                        <Typography>My Plots</Typography>
                        <Stack direction="row">
                          <Typography variant="h2">X</Typography>
                          <Typography variant="h2">109,364</Typography>
                        </Stack>
                      </Stack>
                      <Box display="flex" justifyContent="center">
                        <Typography>GRAPH</Typography>
                      </Box>
                      <Stack gap={0.7}>
                        <Link
                          underline="none"
                          rel="noreferrer"
                          sx={{cursor: "pointer"}}
                        >
                          <Typography variant="body1" sx={{textAlign: 'center'}}>
                            View All Plots
                          </Typography>
                        </Link>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{p: 2, height: "100%"}}>
                    <Stack gap={2} justifyContent="space-between" height="100%">
                      <Stack>
                        <Typography>My Fertilizer</Typography>
                        <Stack direction="row">
                          <Typography variant="h2">X</Typography>
                          <Typography variant="h2">109,364</Typography>
                        </Stack>
                      </Stack>
                      <Box display="flex" justifyContent="center">
                        <Typography>GRAPH</Typography>
                      </Box>
                      <Stack gap={0.7}>
                        <Link
                          underline="none"
                          rel="noreferrer"
                          sx={{cursor: "pointer"}}
                        >
                          <Typography variant="body1" sx={{textAlign: 'center'}}>
                            View All Fertilizer
                          </Typography>
                        </Link>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Grid container direction="row">
                  <Grid item xs={12} md={6}>
                    <Typography>Inactive Rewards</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography>Active Rewards</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Container>
  )
};

export default BalancesPage;
