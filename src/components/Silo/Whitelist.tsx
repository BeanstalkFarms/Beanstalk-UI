import React from 'react';
import { Box, Button, Card, Chip, CircularProgress, Divider, Grid, Link, Stack, Tooltip, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Pool, Token } from '~/classes';
import { AppState } from '~/state';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import { AddressMap, ONE_BN, ZERO_BN } from '~/constants';
import { displayFullBN, displayTokenAmount } from '~/util/Tokens';
import useBDV from '~/hooks/beanstalk/useBDV';
import { BeanstalkPalette, FontSize, IconSize } from '~/components/App/muiTheme';
import Fiat from '~/components/Common/Fiat';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useSetting from '~/hooks/app/useSetting';
import Row from '~/components/Common/Row';
import Stat from '~/components/Common/Stat';
import useUnripeUnderlyingMap from '~/hooks/beanstalk/useUnripeUnderlying';
import useAPY from '~/hooks/beanstalk/useAPY';

const ARROW_CONTAINER_WIDTH = 20;
const TOOLTIP_COMPONENT_PROPS = {
  tooltip: {
    sx: {
      maxWidth: 'none !important',
      boxShadow: '0px 6px 20px 10px rgba(255,255,255,0.3) !important'
    }
  }
};

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
  /// Settings
  const [denomination] = useSetting('denomination');

  /// Chain
  const getChainToken = useGetChainToken();
  const Bean          = getChainToken(BEAN);
  const urBean        = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3    = getChainToken(UNRIPE_BEAN_CRV3);
  const unripeUnderlyingTokens = useUnripeUnderlyingMap();

  /// State
  const apyQuery      = useAPY();
  const latestYield   = apyQuery.data;
  const getBDV        = useBDV();
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const unripeTokens  = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);

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
          <Grid item md={2.5} xs={4}>
            <Typography color="gray">Token</Typography>
          </Grid>
          <Grid item md={3} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Row gap={0.25}>
              <Tooltip
                title={
                  <>
                    The amount of Stalk and Seeds earned for each 1 Bean Denominated Value (BDV) Deposited in the Silo.
                  </>
                }
              >
                <Typography color="gray">
                  Rewards
                </Typography>
              </Tooltip>
              &nbsp;
              <Tooltip
                title={
                  <>
                    <strong>vAPY</strong> (Variable APY) uses historical data about Beans earned by Stalkholders to estimate future return for Depositing in the Silo.&nbsp;<Link underline="hover" href="https://docs.bean.money/guides/silo/understand-vapy" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Learn more</Link>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontSize={FontSize.sm}>
                      <strong>Bean vAPY:</strong> Estimated annual Beans earned by a Stalkholder for depositing an asset.<br />
                      <strong>Stalk vAPY:</strong> Estimated annual growth in Stalk for depositing an asset.
                    </Typography>
                  </>
                }
              >
                <span>
                  <Row gap={0.25}> 
                    <Chip
                      variant="filled"
                      color="primary"
                      label={<Row gap={0.5}><TokenIcon token={BEAN[1]} /> vAPY</Row>}
                      onClick={undefined}
                      size="small"
                    />
                    <Chip
                      variant="filled"
                      color="secondary"
                      label={<Row gap={0.5}><TokenIcon token={STALK} /> vAPY</Row>}
                      onClick={undefined}
                      size="small"
                    />
                    {(apyQuery.loading) && (
                      <CircularProgress variant="indeterminate" size={12} thickness={4} sx={{ ml: 0.5 }} />
                    )}
                  </Row>
                </span>
              </Tooltip>
            </Row>
          </Grid>
          <Grid item md={1.5} xs={0} display={{ xs: 'none', md: 'block' }}>
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
      <Stack gap={1} p={1}>
        {config.whitelist.map((token) => {
          const deposited = farmerSilo.balances[token.address]?.deposited;
          const isUnripe = token === urBean || token === urBeanCrv3;
          
          // APYs
          const seeds = token.getSeeds();
          const apys = (
            latestYield ? 
              seeds.eq(2)
              ? latestYield.bySeeds['2']
              : seeds.eq(4)
              ? latestYield.bySeeds['4']
              : null
            : null
          );

          // Unripe data
          const underlyingToken = isUnripe ? (
            unripeUnderlyingTokens[token.address]
          ) : null;
          const pctUnderlyingDeposited = isUnripe ? (
            (beanstalkSilo.balances[token.address]?.deposited.amount || ZERO_BN)
              .div(unripeTokens[token.address]?.supply || ONE_BN)
          ) : ONE_BN;

          return (
            <Box key={`${token.address}-${token.chainId}`}>
              <Button
                component={RouterLink}
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
                  <Grid item md={2.5} xs={7}>
                    <Row gap={1}>
                      <img
                        src={token.logo}
                        alt={token.name}
                        style={{ height: IconSize.medium, display: 'inline' }}
                      />
                      <Typography color="black" display="inline">
                        {token.name}
                      </Typography>
                    </Row>
                  </Grid>

                  {/** 
                    * Cell: Rewards
                    */}
                  <Grid item md={3} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Row gap={0.75}>
                      <Tooltip placement="right" title={<>1 {token.symbol} = {displayFullBN(getBDV(token))} BDV</>}>
                        <Typography display="inline" color="black">
                          <TokenIcon token={STALK} />{token.rewards?.stalk}{' '}
                          <TokenIcon token={SEEDS} style={{ marginTop: 1.5 }} />{token.rewards?.seeds}
                        </Typography>
                      </Tooltip>
                      <Row gap={0.25}>
                        <Tooltip
                          placement="right"
                          componentsProps={TOOLTIP_COMPONENT_PROPS}
                          title={
                            <Row gap={0}>
                              <Box sx={{ px: 1, py: 0.5, maxWidth: 215 }}>
                                <Stat
                                  title="Beans per Season"
                                  gap={0.25}
                                  variant="h4"
                                  amount={(
                                    latestYield ? displayFullBN(latestYield.beansPerSeasonEMA, Bean.displayDecimals) : '0'
                                  )}
                                  subtitle="14 day exponential moving average of Beans earned by Stalkholders per Season."
                                />
                              </Box>
                              <Box sx={{ px: 1, py: 0.5, maxWidth: 245 }}>
                                The Variable Bean APY uses a moving average of Beans earned by Stalkholders during recent Seasons to estimate a future rate of return.&nbsp;<Link underline="hover" href="https://docs.bean.money/guides/silo/understand-vapy" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Learn more</Link>
                              </Box>
                            </Row>
                          }
                        >
                          <Chip
                            variant="filled"
                            color="primary"
                            label={apys ? `${apys.bean.times(100).toFixed(1)}%` : '0.00%'}
                            onClick={undefined}
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip
                          componentsProps={TOOLTIP_COMPONENT_PROPS}
                          placement="right"
                          title={
                            <Box sx={{ maxWidth: 245 }}>
                              The Stalk APY estimates the growth in your Stalk Ownership for depositing {token.symbol}.&nbsp;<Link underline="hover" href="https://docs.bean.money/guides/silo/understand-vapy#bean-vapy-vs-stalk-vapy" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Learn more</Link>
                            </Box>
                          }
                        >
                          <Chip
                            variant="filled"
                            color="secondary"
                            label={apys ? `${apys.stalk.times(100).toFixed(1)}%` : '0.00%'}
                            onClick={undefined}
                            size="small"
                            sx={{ display: { lg: 'inherit', xs: 'none' } }}
                          />
                        </Tooltip>
                      </Row>
                    </Row>
                  </Grid>

                  {/**
                    * Cell: TVD
                    */}
                  <Grid item md={1.5} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Tooltip
                      placement="right"
                      componentsProps={TOOLTIP_COMPONENT_PROPS}
                      title={
                        isUnripe ? (
                          <Stack gap={0.5}>
                            <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 0, md: 1 }} alignItems="stretch">
                              <Row display={{ xs: 'none', md: 'flex' }}>=</Row>
                              <Box sx={{ px: 1, py: 0.5, maxWidth: 215 }}>
                                <Stat
                                  title={<Row gap={0.5}><TokenIcon token={underlyingToken!} /> Ripe {underlyingToken!.symbol}</Row>}
                                  gap={0.25}
                                  variant="h4"
                                  amount={(
                                    <Fiat
                                      token={underlyingToken!}
                                      amount={unripeTokens[token.address]?.underlying || ZERO_BN}
                                      chop={false}
                                    />
                                  )}
                                  subtitle={`The ${denomination.toUpperCase()} value of the ${underlyingToken!.symbol} underlying all ${token.symbol}.`}
                                />
                              </Box>
                              <Row>×</Row>
                              <Box sx={{ px: 1, py: 0.5, maxWidth: 245 }}>
                                <Stat
                                  title="% Deposited"
                                  gap={0.25}
                                  variant="h4"
                                  amount={`${(pctUnderlyingDeposited).times(100).toFixed(2)}%`}
                                  subtitle={
                                    <>
                                      The percentage of all {token.symbol} that is currently Deposited in the Silo.
                                    </>
                                  }
                                />
                              </Box>
                            </Stack>
                            <Divider />
                            <Box sx={{ pl: { xs: 0, md: 2.7 } }}>
                              <Typography variant="bodySmall" color="gray" textAlign="left">
                                Total Amount Deposited: {displayFullBN(beanstalkSilo.balances[token.address]?.deposited.amount || ZERO_BN, token.displayDecimals)} {token.symbol}<br />
                                Total Supply: {displayFullBN(unripeTokens[token.address]?.supply || ZERO_BN)} {token.symbol}<br />
                              </Typography>
                            </Box>
                          </Stack>
                        ) : (
                          <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 0, md: 1 }} alignItems="stretch">
                            <Row display={{ xs: 'none', md: 'flex' }}>=</Row>
                            <Box sx={{ px: 1, py: 0.5, maxWidth: 245 }}>
                              <Stat
                                title={<Row gap={0.5}><TokenIcon token={token} /> Total Deposited {token.symbol}</Row>}
                                gap={0.25}
                                variant="h4"
                                amount={displayTokenAmount(beanstalkSilo.balances[token.address]?.deposited.amount || ZERO_BN, token, { showName: false })}
                                subtitle={
                                  <>
                                    The total number of {token.symbol} Deposited in the Silo.
                                  </>
                                }
                              />
                            </Box>
                            <Row>×</Row>
                            <Box sx={{ px: 1, py: 0.5 }}>
                              <Stat
                                title={`${token.symbol} Price`}
                                gap={0.25}
                                variant="h4"
                                amount={(
                                  <Fiat
                                    token={token}
                                    amount={ONE_BN}
                                  />
                                )}
                                subtitle={`The current price of ${token.symbol}.`}
                              />
                            </Box>
                          </Stack>
                        )
                      }
                    >
                      <Typography display="inline" color="black">
                        {isUnripe ? (
                          <>
                            <Fiat
                              token={underlyingToken!}
                              amount={(
                                pctUnderlyingDeposited
                                  .times(unripeTokens[token.address]?.underlying || ZERO_BN)
                              )}
                              truncate
                              chop={false}
                            />
                            <Typography display="inline" color={BeanstalkPalette.washedRed}>*</Typography>
                          </>
                        ) : (
                          <Fiat
                            token={token}
                            amount={beanstalkSilo.balances[token.address]?.deposited.amount}
                            truncate
                          />
                        )}
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
                              {displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)} Deposited Beans<br />
                              +&nbsp;
                              <Typography display="inline" color="primary">
                                {displayFullBN(farmerSilo.beans.earned || ZERO_BN, token.displayDecimals)}
                              </Typography> Earned Beans<br />
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
                    <Row justifyContent="flex-end">
                      <Tooltip
                        placement="left"
                        componentsProps={TOOLTIP_COMPONENT_PROPS}
                        title={isUnripe ? (
                          <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 0, md: 1 }} alignItems="stretch">
                            <Box sx={{ px: 1, py: 0.5 }}>
                              <Stat
                                title={<Row gap={0.5}><TokenIcon token={token} /> {token.symbol}</Row>}
                                gap={0.25}
                                variant="h4"
                                amount={displayTokenAmount(deposited?.amount || ZERO_BN, token, { showName: false })}
                                subtitle={
                                  <>
                                    The number of {token.symbol}<br />you have Deposited in the Silo.
                                  </>
                                }
                              />
                            </Box>
                            <Row>×</Row>
                            <Box sx={{ px: 1, py: 0.5, maxWidth: 215 }}>
                              <Stat
                                title="Chop Rate"
                                gap={0.25}
                                variant="h4"
                                amount={`1 - ${(unripeTokens[token.address]?.chopPenalty || ZERO_BN).toFixed(4)}%`}
                                subtitle={
                                  <>
                                    The current penalty for chopping<br />{token.symbol} for {unripeUnderlyingTokens[token.address].symbol}. <Link href="https://docs.bean.money/farm/barn#chopping" target="_blank" rel="noreferrer" underline="hover" onClick={(e) => { e.stopPropagation(); }}>Learn more</Link>
                                  </>
                                }
                              />
                            </Box>
                            <Row>×</Row>
                            <Box sx={{ px: 1, py: 0.5, maxWidth: 215 }}>
                              <Stat
                                title={`${unripeUnderlyingTokens[token.address]} Price`}
                                gap={0.25}
                                variant="h4"
                                amount={(
                                  <Fiat
                                    token={unripeUnderlyingTokens[token.address]}
                                    amount={ONE_BN}
                                    chop={false}
                                  />
                                )}
                                subtitle={`The current price of ${unripeUnderlyingTokens[token.address].symbol}.`}
                              />
                            </Box>
                            <Stack display={{ xs: 'none', md: 'flex' }} alignItems="center" justifyContent="center">=</Stack>
                          </Stack>
                      ) : ''}>
                        <Typography color="black">
                          <Row gap={0.3}>
                            <Fiat
                              token={token}
                              amount={deposited?.amount}
                            />
                            {isUnripe ? (
                              <Typography display="inline" color={BeanstalkPalette.washedRed}>*</Typography>
                            ) : null}
                          </Row>
                        </Typography>
                      </Tooltip>
                      <Stack display={{ xs: 'none', md: 'block' }} sx={{ width: ARROW_CONTAINER_WIDTH }} alignItems="center">
                        <ArrowRightIcon />
                      </Stack>
                    </Row>
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
