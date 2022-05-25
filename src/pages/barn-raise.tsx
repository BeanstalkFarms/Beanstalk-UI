import React, { useCallback, useState } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
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

const WrappedRemainingFertilizer = () => {
  const sun = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  return (
    <RemainingFertilizer
      remaining={fertilizer.remaining}
      humidity={fertilizer.humidity}
      season={sun.season}
      sunrise={sun.sunrise}
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
  // const { data: account } = useAccount();

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
