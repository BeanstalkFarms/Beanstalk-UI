import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { SupportedChainId } from 'constants/chains';
import { useAccount } from 'wagmi';
import useHumidity, { INITIAL_HUMIDITY } from 'hooks/useHumidity';
import { zeroBN } from '../constants';
import { ERC20Token, NativeToken } from '../classes/Token';
import { BEAN, ERC20_TOKENS } from '../constants/v2/tokens';
import useTokenMap from '../hooks/useTokenMap';
import useChainConstant from '../hooks/useChainConstant';
import { AppState } from '../state';
import BarnraisePurchaseForm from '../components/v2/BarnRaise/PurchaseFertilizer/BarnraisePurchaseForm';
import RemainingFertilizer from '../components/v2/BarnRaise/RemainingFertilizer/RemainingFertilizer';
import FertilizerItem from 'components/v2/BarnRaise/FertilizerItem';

const getItems = () =>
  Array(10)
    .fill(0)
    .map((_, ind) => ({ id: `element-${ind}` }));

// rows for "View All Fertilizer" DataGrid
const rows = [
  { id: new BigNumber(5123), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(10000), owedBeans: new BigNumber(1000), },
  { id: new BigNumber(5124), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(15000), owedBeans: new BigNumber(100), },
  { id: new BigNumber(5125), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(1400), owedBeans: new BigNumber(1050), },
  { id: new BigNumber(5126), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(1040), owedBeans: new BigNumber(1000), },
  { id: new BigNumber(5127), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(1000), owedBeans: new BigNumber(100), },
  { id: new BigNumber(5128), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(1030), owedBeans: new BigNumber(1400), },
  { id: new BigNumber(5129), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(100), owedBeans: new BigNumber(10800), },
  { id: new BigNumber(5130), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(1040), owedBeans: new BigNumber(100), },
  { id: new BigNumber(5131), numFertilizer: new BigNumber(10000), humidity: new BigNumber(5), rewards: new BigNumber(100), owedBeans: new BigNumber(1010), },
];

const WrappedRemainingFertilizer = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>(
    (state) => state._beanstalk.sun.sunrise.remaining
  );
  return (
    <RemainingFertilizer
      remaining={fertilizer.remaining}
      nextDecreaseAmount={nextDecreaseAmount}
      // FIXME:
      //  Below "in early July" is hardcoded.
      //  Also hardcoded in getNextExpectedSunrise().
      nextDecreaseTimeString={humidity.eq(INITIAL_HUMIDITY) ? 'in early July' : `in ${nextDecreaseDuration.toFormat('mm:ss')}`}
      humidity={humidity}
    />
  );
};

const MyFertilizer = () => {
  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h6">My Active Fertilizer</Typography>
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Unclaimed Beans:</Typography>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Stack direction="row" gap={0.2}>
                {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
                <Typography>200</Typography>
              </Stack>
              <Link underline="none" href="#"><Typography>(Claim)</Typography></Link>
              <Typography>or</Typography>
              <Link underline="none" href="#"><Typography>(Claim & Deposit)</Typography></Link>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Total Fertilizer Reward:</Typography>
            <Stack direction="row" alignItems="center" gap={0.1}>
              {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
              <Typography>100,000</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Total Owed Beans:</Typography>
            <Stack direction="row" alignItems="center" gap={0.1}>
              {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
              <Typography>100,000</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      {/* Fertilizers */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {rows.map((item) => (
            <Grid key={item.id} item xs={6} md={3}>
              <FertilizerItem
                data={{
                  humidity: item.humidity,
                  remaining: item.rewards,
                  amount: item.numFertilizer,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  )
}

const BarnRaisePage: React.FC = () => {
  const erc20TokenList = useTokenMap(ERC20_TOKENS); // TODO: update tokens
  const bean = useChainConstant(BEAN);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [viewAllFertilizer, setViewAllFertilizer] = useState(false);
  const { data: account } = useAccount();

  // Form
  const [from, setFrom] = useState<NativeToken | ERC20Token>(bean);
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(-1));

  const handleSetFrom = (t: NativeToken | ERC20Token) => setFrom(t);

  const [items] = useState(getItems);

  const handleSetAmount = useCallback((val?: string | BigNumber) => {
    const amt = new BigNumber(!val ? -1 : val); // change to "let"
    // if (amt.gt(balances[from.address])) amt = balances[from.address]; //TODO: turn this on
    setAmount(amt);
  }, []);

  const handleFertilizerDialogClose = () => setViewAllFertilizer(false);
  const handleFertilizerDialogOpen = () => setViewAllFertilizer(true);

  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <PageHeader
          title="The Barn Raise"
          purpose="Rebuilding Beanstalk"
          description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
        />
        {/* Section 1: Fertilizer Remaining */}
        <WrappedRemainingFertilizer />
        {/* Section 2: Purchase Fertilizer */}
        <BarnraisePurchaseForm
          amount={amount}
          handleSetAmount={handleSetAmount}
          from={from}
          handleSetFrom={handleSetFrom}
          erc20TokenList={erc20TokenList}
          balances={balances}
          account={account}
        />
        {/* Section 3: My Fertilizer */}
        <MyFertilizer />
      </Stack>
    </Container>
  );
};

export default BarnRaisePage;
