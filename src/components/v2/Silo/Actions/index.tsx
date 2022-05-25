import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { Token } from 'classes';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';
import { BEAN, WETH, ERC20Tokens, Seeds, Stalk, BEAN_ETH_UNISWAP_V2_LP, ETH } from 'constants/v2/tokens';
import BigNumber from 'bignumber.js';
import useChainConstant from 'hooks/useConstant';
import { ERC20Token, NativeToken } from 'classes/Token';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { displayBN } from 'util/TokenUtilities';
import { BeanPoolState } from 'state/v2/bean/pools';
import { Field, FieldArray, Form, Formik } from 'formik';
import InputField from 'components/v2/Common/Form/InputField';
import TokenAdornment from 'components/v2/Common/Form/TokenAdornment';
import TokenSelectDialog from 'components/v2/Common/Form/TokenSelectDialog';
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

const setDifference = (a: Set<any>, b: Set<any>) => new Set(
  [...a].filter(x => !b.has(x))
)
// const setIntersection

const Deposit : React.FC<{
  to: Token;
  poolState: BeanPoolState;
}> = ({
  to,
  poolState,
}) => {
  const Bean = useChainConstant(BEAN);
  const Weth = useChainConstant(WETH);
  const baseTokens = useMemo(() => ([
    BEAN,
    ETH,
  ]), [])
  const erc20TokenList = useTokenMap(baseTokens);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  
  //
  const [from, setFrom] = useState<NativeToken | ERC20Token>(Bean);
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(-1));
  const [showTokenSelect, setShowTokenSelect] = useState(false);
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
  const initialValues = useMemo(() => ({
    tokens: [
      {
        token: Bean,
        amount: undefined,
      },
    ],
  }), [Bean]);

  // if (!poolState) return null;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            <Stack gap={1}>
              {/* <div><pre>{JSON.stringify(values, null, 2)}</pre></div> */}
              {/* Deposit Amount */}
              <FieldArray name="tokens">
                {(arrayHelpers) => {
                  return (
                    <div>
                      <TokenSelectDialog
                        open={showTokenSelect}
                        handleClose={() => setShowTokenSelect(false)}
                        selected={values.tokens}
                        onSelect={(_tokens: Set<Token>) => {
                          // If the user has typed some existing values in,
                          // save them. Add new tokens to the end of the list.
                          // FIXME: match sorting of erc20TokenList
                          const copy = new Set(_tokens);
                          const v = values.tokens.filter(x => {
                            copy.delete(x.token);
                            return _tokens.has(x.token);
                          });
                          setFieldValue('tokens', [
                            ...v,
                            ...Array.from(copy).map((token) => ({ token, amount: 0 })),
                          ])
                        }}
                        balances={balances}
                        tokenList={erc20TokenList}
                      />
                      {values.tokens.map((token, index) => (
                        <div key={token.token.address}>
                          <InputField
                            name={`tokens.${index}.amount`}
                            InputProps={{
                              endAdornment: (
                                <TokenAdornment
                                  token={token.token}
                                  onClick={() => setShowTokenSelect(true)}
                                />
                              )
                            }}
                          />
                          <button onClick={() => setFieldValue(`tokens.${index}.amount`, 69420)}>Max</button>
                        </div>
                      ))}
                    </div>
                  )
                }}
              </FieldArray>
              <Button disabled type="submit" size="large" fullWidth>
                Deposit
              </Button>
            </Stack>
          </Form>
        );
      }}
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
