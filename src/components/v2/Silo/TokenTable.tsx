import React from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Token } from 'classes';
import { Link } from 'react-router-dom';

const arrowContainerWidth = 20;

const TokenTable : React.FC<{
  tokens: Token[];
}> = (props) => (
  <Card>
    {/* Table Header */}
    <Box
      display="flex"
      sx={{ 
        px: 3, // 1 + 2 from Table Body
        py: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'secondary.main', 
        borderBottomWidth: 1.5 
      }}
      >
      <Grid container alignItems="flex-end">
        <Grid item xs={3}>
          <Typography color="gray">Silo Whitelisted Token</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography color="gray">Rewards</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography color="gray">TVL</Typography>
          <Typography color="black" fontWeight="bold">$2.21B</Typography>
        </Grid>
        <Grid item xs={3} sx={{ textAlign: 'right', paddingRight: `${arrowContainerWidth}px` }}>
          <Typography color="gray">My Deposits</Typography>
          <Typography color="black" fontWeight="bold">$109,609.92</Typography>
        </Grid>
      </Grid>
    </Box>
    {/**
      * Table Body
      *   padding = 1 (10px)
      *   gap     = 1
      * 
      * Rows
      *   px      = 2 (10px)
      *   border  = 1px
      *   gap     = 0
      */}
    <Stack direction="column" gap={1} sx={{ p: 1 }}>
      {props.tokens.map((token) => (
        <Box>
          <Button
            component={Link}
            to={`/silo/${token.address}`}
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{
                  textAlign: 'left',
                  px: 2,
                  py: 1.5,
                }}
              >
            <Grid container alignItems="center">
              <Grid item xs={3}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <img
                    src={token.logo}
                    alt={token.name}
                    style={{ height: 20, display: 'inline' }}
                  />
                  <Typography color="black" display="inline">
                    {token.name}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={3}>
                <Typography color="black">
                  {}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography color="black">$1.5B</Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Stack direction="row" alignItems="center" justifyContent="flex-end">
                  <Typography color="black">$59,015.91</Typography>
                  <Stack sx={{ width: arrowContainerWidth, }} alignItems="center">
                    <ArrowRightIcon color="black" />
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Button>
        </Box>
      ))}
      <Box>
        <Button variant="contained" color="primary" size="large" fullWidth>
          Convert Allocation of Deposited Assets
        </Button>
      </Box>
    </Stack>
  </Card>
  );

export default TokenTable;
