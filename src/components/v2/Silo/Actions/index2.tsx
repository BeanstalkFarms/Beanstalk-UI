import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { Token } from 'classes';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';
import { BEAN, ERC20_TOKENS, SEEDS, STALK } from 'constants/v2/tokens';
import BigNumber from 'bignumber.js';
import TokenInputField from 'components/v2/Common/Form/MultiTokenInputField';
import useChainConstant from 'hooks/useChainConstant';
import { ERC20Token, NativeToken } from 'classes/Token';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { displayBN } from 'util/TokenUtilities';
import { BeanPoolState } from 'state/v2/bean/pools';
import { Form, Formik } from 'formik';
// import { clearBalances } from 'state/v2/farmer/balances/actions';
// import { zeroBN } from 'constants/index';

// const calculateRewards = (
//   tokenIn: Token,
//   amountIn: BigNumber,
//   tokenOut: Token,
// ) => ({
//     amountOut: new BigNumber(0),
//     stalk: new BigNumber(0),
//     seeds: new BigNumber(0),
//   });

const Deposit : React.FC<{
  to: Token;
  poolState: BeanPoolState;
}> = ({
  to,
  poolState,
}) => {
  const erc20TokenList = useTokenMap(ERC20_TOKENS);
  const bean = useChainConstant(BEAN);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [from, setFrom] = useState<NativeToken | ERC20Token>(bean);
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(-1));
  const { data: account } = useAccount();

  //
  const handleSetAmount = useCallback((val?: string | BigNumber) => {
    let amt = new BigNumber(!val ? -1 : val);
    if (amt.gt(balances[from.address])) amt = balances[from.address];
    setAmount(amt);
  }, [from, balances]);
  const handleMax = useCallback(() => {
    handleSetAmount(balances[from.address]);
  }, [handleSetAmount, balances, from]);
  const handleReset = useCallback(() => {
    setAmount(new BigNumber(-1));
  }, []);
  
  // When `token` changes, reset the `amount` input.
  useEffect(() => {
    setAmount(new BigNumber(-1));
  }, [from]);

  // When `wallet` changes and amount > wallet balance, reset the `amount` input
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, handleReset]);

  //
  console.debug(poolState);
  // const poolForLP = (_amount: BigNumber) => (
  //   _amount.lte(0)
  //     ? [zeroBN, zeroBN]
  //     : Pool.poolForLP(
  //       _amount,
  //       poolState.reserves[0],
  //       poolState.reserves[1],
  //       poolState.supply,
  //     )
  // );

  const initialValues = useMemo(() => ({
    tokens: [
      {
        token: bean,
        amount: new BigNumber(-1),
      },
      {
        token: bean,
        amount: new BigNumber(100),
      },
    ],
  }), [bean]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      <Form>
        <Stack gap={1}>
          {/* Deposit Amount */}
          <TokenInputField
            amount={amount}
            setAmount={handleSetAmount}
            token={from}
            setToken={(t: Token) => setFrom(t as ERC20Token)}
            tokenList={erc20TokenList}
          />
          {/* Max Module */}
          {/* <Stack direction="row" alignItems="center" spacing={0.5} px={0.75}>
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }} spacing={1}>
              {token === ETH ? (
                <>
                  <Typography variant="body1" sx={{ fontSize: 13.5 }}>
                    = {displayBN(usdcAmount)} USDC
                  </Typography>
                  {quoting && <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />}
                </>
              ) : null}
            </Stack>
            <Typography sx={{ fontSize: 13.5 }}>
              Balance: {balances[from.address] ? displayBN(balances[from.address]) : '0'}
            </Typography>
            <Typography variant="body1" onClick={handleMax} color="primary" sx={{ fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
              (Max)
            </Typography>
          </Stack> */}
          {/* Output */}
          {/* {amount.gt(0) ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={to}
                value={amount}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={Stalk}
                    value={new BigNumber(10_000)}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={Seeds}
                    value={new BigNumber(10_000)}
                  />
                </Box>
              </Stack>
            </Stack>
          ) : null} */}
          <Button disabled type="submit" size="large" fullWidth>
            Deposit
          </Button>
        </Stack>
      </Form>
    </Formik>
  );
};

// -----------------------------------------------------------------------

const Actions : React.FC<{
  token: Token;
  poolState: BeanPoolState;
}> = (props) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Deposit" />
            <Tab label="Withdraw" />
          </Tabs>
          <Box>
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Stack>
        {/* Tabs */}
        <Box>
          {tab === 0 ? (
            <Deposit
              to={props.token}
              poolState={props.poolState}
            />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
