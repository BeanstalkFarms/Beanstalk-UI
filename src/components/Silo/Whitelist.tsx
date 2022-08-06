import React from 'react';
import { Box, Button, Card, Divider, Grid, Stack, Tooltip, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { Pool, Token } from '~/classes';
import { AppState } from '~/state';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, BEAN_CRV3_LP, SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import { AddressMap, ONE_BN, ZERO_BN } from '~/constants';
import { displayFullBN, displayTokenAmount } from '~/util/Tokens';
import useBDV from '~/hooks/useBDV';
import { BeanstalkPalette, FontSize, IconSize } from '~/components/App/muiTheme';
import Fiat from '~/components/Common/Fiat';
import useGetChainToken from '~/hooks/useGetChainToken';
import useSetting from '~/hooks/useSetting';

const ARROW_CONTAINER_WIDTH = 20;

/**
 * Display a pseudo-table of Whitelisted Silo Tokens.
 * This table is the entry point to deposit Beans, LP, etc.
 */
const Whitelist : React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  config: {
    whitelist: Token[];
    poolsByAddress: AddressMap<Pool>;
  };
}> = ({
  farmerSilo,
  config,
}) => {
  ///
  const [denomination] = useSetting('denomination');

  ///
  const getChainToken = useGetChainToken();
  const Bean          = getChainToken(BEAN);
  const BeanCrv3      = getChainToken(BEAN_CRV3_LP);
  const urBean        = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3    = getChainToken(UNRIPE_BEAN_CRV3);
  const chopPairs     = {
    [urBean.address]: Bean,
    [urBeanCrv3.address]: BeanCrv3,
  };

  ///
  const getBDV        = useBDV();
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const chopPenalties = useSelector<AppState, AppState['_bean']['unripe']['chopRates']>((state) => state._bean.unripe.chopRates);

  return (
    <Card>
      <Box
        display="flex"
        sx={{ 
          px: 3,      // 1 + 2 from Table Body
          pt: '14px', // manually adjusted
          pb: '5px',  // manually adjusted
          borderBottomStyle: 'solid',
          borderBottomColor: 'secondary.main', 
          borderBottomWidth: 1.5,
        }}
      >
        <Grid container alignItems="flex-end">
          <Grid item md={3} xs={4}>
            <Typography color="gray">Token</Typography>
          </Grid>
          <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Tooltip title="Stalk and Seeds earned for each 1 Bean Denominated Value (BDV) Deposited in the Silo.">
              <Typography color="gray">
                Rewards
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Tooltip title="Total Value Deposited in the Silo.">
              <Typography color="gray">TVD</Typography>
            </Tooltip>
          </Grid>
          <Grid item md={3.5} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Typography color="gray">Amount Deposited</Typography>
          </Grid>
          <Grid item md={1.5} xs={8} sx={{ textAlign: 'right', paddingRight: { xs: 0, md: `${ARROW_CONTAINER_WIDTH}px` } }}>
            <Tooltip title={(
              <>
                The value of your Silo deposits for each whitelisted token, denominated in {denomination === 'bdv' ? 'Beans' : 'USD'}.<br />
                <Typography color="gray" fontSize={FontSize.sm} fontStyle="italic">
                  Switch to {denomination === 'bdv' ? 'USD' : 'Beans'}: Option + F
                </Typography>
              </>
            )}>
              <Typography color="gray">Value Deposited</Typography>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Stack direction="column" gap={1} sx={{ p: 1 }}>
        {config.whitelist.map((token) => {
          const deposited   = farmerSilo.balances[token.address]?.deposited;
          /// TEMP: CHOP
          const isUnripe    = token === urBean || token === urBeanCrv3;
          const chopPenalty = isUnripe ? new BigNumber(1).minus(chopPenalties[token.address]).multipliedBy(100) : ZERO_BN; 
          return (
            <Box key={`${token.address}-${token.chainId}`}>
              <Button
                component={Link}
                to={`/silo/${token.address}`}
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                sx={{
                  textAlign: 'left',
                  px: 2,
                  py: 1.5,
                }}
              >
                <Grid container alignItems="center">
                  {/**
                    * Cell: Token
                    */}
                  <Grid item md={3} xs={7}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <img
                        src={token.logo}
                        alt={token.name}
                        style={{ height: IconSize.medium, display: 'inline' }}
                      />
                      <Typography color="black" display="inline">
                        {token.name}
                      </Typography>
                    </Stack>
                  </Grid>

                  {/** 
                    * Cell: Rewards
                    */}
                  <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Tooltip placement="right" title={<>1 {token.symbol} = {displayFullBN(getBDV(token))} BDV</>}>
                      <Typography display="inline" color="black">
                        <TokenIcon token={STALK} />{token.rewards?.stalk} &nbsp;
                        <TokenIcon token={SEEDS} style={{ marginTop: 1.5 }} />{token.rewards?.seeds}
                      </Typography>
                    </Tooltip>
                  </Grid>

                  {/**
                    * Cell: TVD
                    */}
                  <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Tooltip placement="right" title={<>{displayTokenAmount(beanstalkSilo.balances[token.address]?.deposited.amount || ZERO_BN, token, { showName: false })} {token.symbol}</>}>
                      <Typography display="inline" color="black">
                        <Fiat
                          token={token}
                          amount={beanstalkSilo.balances[token.address]?.deposited.amount}
                          truncate
                        />
                        {isUnripe ? (
                          <Typography display="inline" color={BeanstalkPalette.washedRed}>*</Typography>
                        ) : null}
                      </Typography>
                    </Tooltip>
                  </Grid>

                  {/**
                    * Cell: Deposited Amount
                    */}
                  <Grid item md={3.5} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Typography color="black">
                      {/* If this is the entry for Bean deposits,
                        * display Earned Beans and Deposited Beans separately.
                        * Internally they are both considered "Deposited". */}
                      {token === Bean
                        ? (
                          <Tooltip title={(
                            <>
                              {displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)} Deposited BEAN<br />
                              +&nbsp;
                              <Typography display="inline" color="primary">
                                {displayFullBN(farmerSilo.beans.earned || ZERO_BN, token.displayDecimals)}
                              </Typography> Earned BEAN<br />
                              <Divider sx={{ my: 0.5, opacity: 0.7, borderBottomWidth: 0, }} />
                              = {displayFullBN(farmerSilo.beans.earned.plus(deposited?.amount || ZERO_BN), token.displayDecimals)} BEAN<br />
                            </>
                          )}>
                            <span>
                              {displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)}
                              {farmerSilo.beans.earned.gt(0) ? (
                                <Typography component="span" color="primary.main">
                                  {' + '}
                                  {displayFullBN(farmerSilo.beans.earned, token.displayDecimals)}
                                </Typography>
                              ) : null}
                            </span>
                          </Tooltip>
                        )
                        : displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)}
                      <Box display={{ md: 'inline', xs: 'none' }}>&nbsp;{token.symbol}</Box>
                    </Typography>
                  </Grid>
                  
                  {/**
                    * Cell: My Deposits
                    */}
                  <Grid item md={1.5} xs={5}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Tooltip
                        placement="left"
                        title={isUnripe ? (
                          <>
                            <Typography fontWeight="bold" mb={1}>
                              {denomination === 'bdv' ? 'Bean' : 'USD'} Value
                            </Typography>
                            <div>
                              {displayTokenAmount(deposited?.amount || ZERO_BN, token, { showName: false })} {token.symbol}
                            </div>
                            <div>
                              ×&nbsp;
                              <Typography display="inline" color={BeanstalkPalette.washedRed}>
                                {chopPenalty.toFixed(4)}%
                              </Typography>
                              &nbsp;Chop Penalty
                            </div>
                            <div>
                              × <Fiat
                                token={chopPairs[token.address]}
                                amount={ONE_BN}
                                chop={false}
                            /> per {chopPairs[token.address].symbol}
                            </div>
                            <Divider sx={{ my: 0.5, opacity: 0.7, borderBottomWidth: 0, }} />
                            <div>
                              =&nbsp;
                              <Fiat
                                token={token}
                                amount={deposited?.amount}
                              />
                            </div>
                          </>
                      ) : ''}>
                        <Typography color="black">
                          <Stack direction="row" gap={0.3}>
                            <Fiat
                              token={token}
                              amount={deposited?.amount}
                            />
                            {isUnripe ? (
                              <Typography display="inline" color={BeanstalkPalette.washedRed}>*</Typography>
                            ) : null}
                          </Stack>
                        </Typography>
                      </Tooltip>
                      <Stack display={{ xs: 'none', md: 'block' }} sx={{ width: ARROW_CONTAINER_WIDTH, }} alignItems="center">
                        <ArrowRightIcon />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
};

export default Whitelist;
