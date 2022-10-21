import React, { useMemo } from 'react';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector } from 'react-redux';
import { SEEDS, STALK } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';
import Fiat from '~/components/Common/Fiat';

import Row from '../Common/Row';
import { displayFullBN } from '~/util';
import TokenIcon from '../Common/TokenIcon';
import { AppState } from '~/state';
import { ZERO_BN } from '~/constants';
import useFarmerStalkByToken from '~/hooks/farmer/useFarmerStalkByToken';

const ARROW_CONTAINER_WIDTH = 20;

const SiloBalances: React.FC<{}> = () => {
  // Chain Constants
  const whitelist = useWhitelist();

  // State
  const balances = useSelector<
    AppState,
    AppState['_farmer']['silo']['balances']
  >((state) => state._farmer.silo.balances);
  const stalkByToken = useFarmerStalkByToken();

  const tokens = useMemo(() => Object.entries(whitelist), [whitelist]);

  return (
    <Stack width="100%">
      <Box
        {...{ pb: 0.5, px: 1, pt: 1.5 }}
        sx={{ borderBottom: `1px solid ${BeanstalkPalette.lightestGrey}` }}
      >
        <Grid
          container
          rowSpacing={1}
          width="100%"
          boxSizing="border-box"
          whiteSpace="nowrap"
        >
          <Grid item xs={6} sm={5} md={3} textAlign="left" pl={2}>
            <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
              Token
            </Typography>
          </Grid>
          <Grid
            item
            {...{ xs: 0, sm: 4, md: 2 }}
            display={{ xs: 'none', sm: 'block' }}
            textAlign="left"
          >
            <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
              Amount Deposited
            </Typography>
          </Grid>
          <Grid
            item
            {...{ xs: 6, sm: 3, md: 2.5 }}
            pr={{ xs: 4, md: 0 }}
            textAlign="right"
          >
            <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
              Value Deposited
            </Typography>
          </Grid>
          <Grid
            item
            {...{ xs: 0, md: 2 }}
            display={{ xs: 'none', md: 'block' }}
            textAlign="right"
          >
            <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
              Stalk
            </Typography>
          </Grid>
          <Grid
            item
            {...{ xs: 0, md: 2.5 }}
            display={{ xs: 'none', md: 'block' }}
            textAlign="right"
            pr={4}
          >
            <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
              Seeds
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Stack px={1} py={1} spacing={1}>
        {tokens.map(([address, token]) => {
          const deposits = balances[address]?.deposited;
          return (
            <Box key={`${token.address}-${token.chainId}`}>
              <Button
                component={RouterLink}
                to={`/silo/${address}`}
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                sx={{
                  textAlign: 'left',
                  px: 0,
                  py: 1,
                  borderColor: BeanstalkPalette.lightestGrey,
                }}
              >
                <Grid container alignItems="center">
                  {/** 
                    * Cell: Token
                    */}
                  <Grid item {...{ xs: 6, sm: 5, md: 3 }} pl={2}>
                    <Row gap={1}>
                      <img
                        src={token.logo}
                        alt={token.name}
                        css={{ height: IconSize.medium, display: 'inline' }}
                      />
                      <Typography display="inline" color="text.primary">
                        {token.name}
                      </Typography>
                    </Row>
                  </Grid>
                  {/** 
                     * Cell: Amount Deposited 
                     */}
                  <Grid
                    item
                    {...{ xs: 0, sm: 4, md: 2 }}
                    display={{ xs: 'none', sm: 'block' }}
                    textAlign="left"
                  >
                    <Typography color="text.primary">
                      {displayFullBN(deposits?.amount ?? ZERO_BN, 0)}{' '}
                      {token.symbol}
                    </Typography>
                  </Grid>
                  {/**
                     * Cell: Value of Deposited 
                     */}
                  <Grid
                    item
                    {...{ xs: 6, sm: 3, md: 2.5 }}
                    textAlign="right"
                    pr={{ xs: 2, md: 0 }}
                  >
                    <Row justifyContent="flex-end">
                      <Typography color="text.primary">
                        <Fiat
                          token={token}
                          amount={deposits?.amount ?? ZERO_BN}
                        />
                      </Typography>
                      <Stack
                        display={{ xs: 'block', md: 'none' }}
                        sx={{ width: ARROW_CONTAINER_WIDTH }}
                        alignItems="center"
                      >
                        <ArrowRightIcon
                          sx={{ color: BeanstalkPalette.lightestGrey }}
                        />
                      </Stack>
                    </Row>
                  </Grid>
                  {/** 
                     * Cell: Stalk 
                     */}
                  <Grid
                    item
                    {...{ xs: 0, md: 2 }}
                    display={{ xs: 'none', md: 'block' }}
                    textAlign="right"
                  >
                    <Row justifyContent="flex-end" gap={0.2}>
                      <TokenIcon token={STALK} css={{ marginBottom: '2px' }} />
                      <Typography color="text.primary" component="span">
                        {displayFullBN(
                          (stalkByToken[address]?.base ?? ZERO_BN).plus(
                            stalkByToken[address]?.grown ?? ZERO_BN
                          ) ?? ZERO_BN,
                          STALK.displayDecimals
                        )}
                      </Typography>
                    </Row>
                  </Grid>
                  {/** 
                     *Cell: Seeds
                     */}
                  <Grid
                    item
                    {...{ xs: 0, md: 2.5 }}
                    display={{ xs: 'none', md: 'block' }}
                    textAlign="right"
                    pr={2}
                  >
                    <Row justifyContent="flex-end">
                      <Row gap={0.2}>
                        <TokenIcon token={SEEDS} />
                        <Typography color="text.primary" component="span">
                          {displayFullBN(
                            token.getSeeds(deposits?.bdv ?? ZERO_BN),
                            0
                          )}
                        </Typography>
                      </Row>
                      <Stack
                        display={{ xs: 'none', md: 'block' }}
                        sx={{ width: ARROW_CONTAINER_WIDTH }}
                        alignItems="center"
                      >
                        <ArrowRightIcon
                          sx={{ 
                            color: BeanstalkPalette.lightestGrey,
                            marginTop: '3px'
                          }}
                        />
                      </Stack>
                    </Row>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default SiloBalances;
