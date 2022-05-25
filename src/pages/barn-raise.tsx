import React, { useCallback, useMemo, useState } from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { SupportedChainId } from 'constants/chains';
import { zeroBN } from 'constants/index';
import { ERC20Token, NativeToken } from '../classes/Token';
import { BEAN, ERC20Tokens } from '../constants/v2/tokens';
import useTokenList from '../hooks/useTokenList';
import useChainConstant from '../hooks/useConstant';
import { AppState } from '../state';
import HorizontalScroll from '../components/v2/BarnRaise/HorizontalScroll';
import BarnraisePurchaseForm from '../components/v2/BarnRaise/BarnraisePurchaseForm';
import RemainingFertilizer from '../components/v2/BarnRaise/RemainingFertilizer';
import { displayBN } from '../util';

const getItems = () =>
  Array(20)
    .fill(0)
    .map((_, ind) => ({ id: `element-${ind}` }));

// -- 
const HUMIDITY_DECREASE_UNPAUSE = new BigNumber(-250);
const HUMIDITY_DECREASE_PER_SEASON = new BigNumber(-0.5);
const UNPAUSE_SEASONS = {
  [SupportedChainId.MAINNET]: 6074,
  [SupportedChainId.ROPSTEN]: 564,  // current as of may 24
};

const WrappedRemainingFertilizer = () => {
  const unpauseSeason = useChainConstant(UNPAUSE_SEASONS);
  const sun = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>(
    (state) => state._beanstalk.sun.sunrise.remaining
  );
  // const sunrise = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']>(
  //   (state) => state._beanstalk.sun.sunrise
  // );

  //
  const beforeUnpause = useMemo(() => sun.season.lte(unpauseSeason), [sun.season, unpauseSeason]);
  const nextDecreaseAmount = useMemo(() => {
    if (beforeUnpause)                return HUMIDITY_DECREASE_UNPAUSE;
    if (fertilizer.humidity.gt(20))   return HUMIDITY_DECREASE_PER_SEASON;
    return zeroBN;
  }, [fertilizer.humidity, beforeUnpause]);

  return (
    <RemainingFertilizer
      remaining={fertilizer.remaining}
      humidity={new BigNumber(500)}
      nextDecreaseAmount={nextDecreaseAmount}
      // FIXME:
      //  Below "in early July" is hardcoded.
      //  Also hardcoded in getNextExpectedSunrise().
      nextDecreaseTimeString={beforeUnpause ? 'in early July' : `in ${nextDecreaseDuration.toFormat('mm:ss')}`}
      // humidity={fertilizer.humidity}
      // nextSunrise={sunrise.next}
    />
  );
};

const BarnRaisePage: React.FC = () => {
  const erc20TokenList = useTokenList(ERC20Tokens); // TODO: update tokens
  const bean = useChainConstant(BEAN);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);

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

  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <PageHeader
          title="The Barn Raise"
          purpose="Rebuilding Beanstalk"
          description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
        />
        <WrappedRemainingFertilizer />
        <BarnraisePurchaseForm
          amount={amount}
          handleSetAmount={handleSetAmount}
          from={from}
          handleSetFrom={handleSetFrom}
          erc20TokenList={erc20TokenList}
          balances={balances}
        />
        <HorizontalScroll items={items} />
      </Stack>
    </Container>
  );
};

export default BarnRaisePage;
