import React from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { Pool, Token } from 'classes';
import { AppState } from 'state';
import useUSD from 'hooks/useUSD';
import { displayBN } from 'util/index';
import { zeroBN } from 'constants/index';

const arrowContainerWidth = 20;

const TokenTable : React.FC<{
  config: {
    /** Array of Whitelisted tokens in the Silo. */
    whitelist: Token[];
    /** */
    poolsByAddress: { [address: string] : Pool };
  };
  // beanPrice:  AppState['_bean']['price'];
  beanPools:  AppState['_bean']['pools'];
  farmerSilo: AppState['_farmer']['silo'];
}> = ({
  config,
  // beanPrice,
  beanPools,
  farmerSilo,
}) => {
  const getUSD = useUSD();
  return (
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
      <Stack direction="column" gap={1} sx={{ p: 1 }}>
        {config.whitelist.map((token) => {
          const deposited = farmerSilo.tokens[token.address]?.deposited;

          if (!deposited) return null;
          // let usdValue : BigNumber;
          // if (!deposited || deposited.eq(0)) {
          //   usdValue = new BigNumber(0);
          // } else if (/* config.poolsByAddress[token.address] && */beanPools[token.address]) {
          //   const tokensFromLP = Pool.poolForLP(
          //     deposited || new BigNumber(0),
          //     beanPools[token.address]?.reserves[0],
          //     beanPools[token.address]?.reserves[1],
          //     beanPools[token.address]?.supply,
          //   );
          //   const underlyingBDV = tokensFromLP[0].multipliedBy(2);
          //   usdValue = underlyingBDV.multipliedBy(beanPrice[0]);
          // } else {
          //   usdValue = deposited.times(beanPrice[0]);
          // }

          return (
            <Box key={`${token.address}-${token.chainId}`}>
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
                      Rewards
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography color="black">
                      ${displayBN(beanPools[token.address]?.liquidity || zeroBN)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Typography color="black">
                        ${getUSD(deposited.bdv).toFixed(2)}
                      </Typography>
                      <Stack sx={{ width: arrowContainerWidth, }} alignItems="center">
                        <ArrowRightIcon />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
        <Box>
          <Button variant="contained" color="primary" size="large" fullWidth>
            Convert Allocation of Deposited Assets
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};

export default TokenTable;
