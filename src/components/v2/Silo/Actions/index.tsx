import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CircularProgress, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import debounce from 'lodash/debounce';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { BeanPoolState } from 'state/v2/bean/pools';
import { FieldArray, Form, Formik, FormikProps, useFormikContext } from 'formik';
import InputField from 'components/v2/Common/Form/InputField';
import TokenAdornment from 'components/v2/Common/Form/TokenAdornment';
import TokenSelectDialog from 'components/v2/Common/Form/TokenSelectDialog';
import BigNumber from 'bignumber.js';
import { displayBN, toTokenUnitsBN } from 'util/TokenUtilities';
import { zeroBN } from 'constants/index';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';

type DepositFormValues = {
  tokens: ({
    token: Token;
    // amount?: number;
    amount?: BigNumber;
    amountOut?: BigNumber;
    quoting?: boolean;
  })[]
}

// enum InstructionType {
//   SWAP
// }
// class Instruction {
//   type : InstructionType;

//   constructor(
//     type: InstructionType,
//   ) {
//     this.type = type;
//   }
// }

// amount of beans to buy with non-bean tokens, based on each token.amount -> bean conversion
// -> the exchange rate for each token -> bean
// existing beans to use
//
// stalk = 1*BDV if token = any,
// seeds = 2*BDV if token = Bean, 4*BDV if token = BeanEthLP
//
// need to update each token only when its value changes
// 

// type DepositSummary = {}

const useDepositSummary = (to: Token, tokens: DepositFormValues['tokens']) => tokens.reduce((agg, curr) => {
    const amount = (
      curr.token === to
        ? curr.amount
        : curr.amountOut
    );
    if (amount) {
      agg.bdv   = agg.bdv.plus(amount);
      agg.stalk = agg.stalk.plus(amount.times(to.rewards?.stalk || 0));
      agg.seeds = agg.seeds.plus(amount.times(to.rewards?.seeds || 0));
    }
    return agg;
  }, { bdv: zeroBN, stalk: zeroBN, seeds: zeroBN });

const sleep = (ms: number = 1000) => new Promise((r) => setTimeout(() => { r(); }, ms));

function useQuote(tokenOut: Token) : [
  amountIn: BigNumber | undefined,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: Token, _amountIn: BigNumber) => void,
] {
  /** The `amountOut` of `tokenOut` received in exchange for `amountIn` of `tokenIn`. */
  const [amountOut, setAmountOut] = useState<BigNumber | undefined>(undefined);
  /** Whether we're currently waiting for a quote for this swap. */
  const [quoting, setQuoting] = useState<boolean>(false);

  /**
   * When token changes, reset the amount.
   */
   useEffect(() => {
    setAmountOut(undefined);
    setQuoting(false);
  }, [tokenOut]);

  /**
   * 
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: Token, amountIn: BigNumber) => sleep(250)
        .then(() => new BigNumber(3000_000000).times(amountIn))
        .then((result) => {
          setAmountOut(toTokenUnitsBN(result.toString(), tokenOut.decimals));
          setQuoting(false);
          return result;
        }),
    1500,
    { trailing: true }
  ), [
    tokenOut,
    setQuoting,
    setAmountOut
  ]);

  /**
   * Handler to refresh
   */
  const getAmountOut = useCallback((tokenIn: Token, amountIn: BigNumber) => {
    if (tokenIn === tokenOut) return;
    if (amountIn.lte(0)) {
      setAmountOut(undefined);
      setQuoting(false);
    } else {
      setQuoting(true);
      _getAmountOut(tokenIn, amountIn);
    }
  }, [
    tokenOut,
    _getAmountOut,
    setAmountOut,
    setQuoting
  ]);

  return [amountOut, quoting, getAmountOut];
}

const TokenField : React.FC<{
  name: string;
  balance?: number;
  tokenOut: Token;
  data: DepositFormValues['tokens'][0];
  showTokenSelect: () => void;
}> = ({
  name,
  balance,
  tokenOut,
  data,
  showTokenSelect,
}) => {
  // Setup a price quote for this token
  const [amountOut, quoting, getAmountOut] = useQuote(tokenOut);
  const { setFieldValue } = useFormikContext();

  // Convert the amount to a BigNumber on change.
  useEffect(() => {
    console.debug('getAmountOut', data.amount, typeof data.amount);
    getAmountOut(data.token, new BigNumber(data.amount || 0));
  }, [data.token, data.amount, getAmountOut]);

  // Store amountOut and quoting in form state.
  // FIXME: Antipattern here? Should we have 
  // a version of `useQuote` that handles this automatically?
  useEffect(() => {
    setFieldValue(`${name}.amountOut`, amountOut);
  }, [name, setFieldValue, amountOut]);
  useEffect(() => {
    setFieldValue(`${name}.quoting`, quoting);
  }, [name, setFieldValue, quoting]);

  // Memoize the token adornment
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={data.token}
        onClick={showTokenSelect}
      />
    )
  }), [data.token, showTokenSelect]);

  //
  const Quote = useMemo(() => (
    <>
      {amountOut && (
        <Typography variant="body1" sx={{ fontSize: 13.5 }}>
          = {displayBN(amountOut)} {tokenOut.symbol}
        </Typography>
      )}
      {quoting && (
        <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />
      )}
    </>
  ), [amountOut, quoting, tokenOut.symbol]);

  return (  
    <InputField
      fullWidth
      name={`${name}.amount`}
      balance={balance}
      quote={Quote}
      InputProps={InputProps}
    />
  );
};

const DepositForm : React.FC<
  FormikProps<DepositFormValues>
  & { to: Token }
> = ({
  // Custom
  to,
  // Formik
  values,
  setFieldValue,
}) => {
  // TODO: extract these?
  const baseTokens = useMemo(() => ([BEAN, ETH]), []);
  const erc20TokenList = useTokenMap(baseTokens);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const { bdv, stalk, seeds } = useDepositSummary(to, values.tokens);

  // console.debug('[DepositForm] render');
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const v = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...v,
      ...Array.from(copy).map((token) => ({ token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);
  
  return (
    <Form noValidate>
      <Stack gap={1}>
        {/* <div><pre>{JSON.stringify(values, null, 2)}</pre></div> */}
        {/* Deposit Amount */}
        <FieldArray name="tokens">
          {() => (
            <div>
              <TokenSelectDialog
                open={showTokenSelect}
                handleClose={handleClose}
                selected={values.tokens}
                handleSubmit={handleSelectTokens}
                balances={balances}
                tokenList={erc20TokenList}
              />
              <Stack gap={1.5}>
                {values.tokens.map((data, index) => (
                  <TokenField
                    name={`tokens.${index}`}
                    tokenOut={to}
                    balance={balances[data.token.address] || undefined}
                    data={data}
                    showTokenSelect={handleOpen}
                  />
                ))}
              </Stack>
            </div>
          )}
        </FieldArray>
        {/* <Box sx={{ fontSize: 12 }}>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Box> */}
        {bdv.gt(0) ? (
          <Stack direction="column" gap={1}>
            <TokenOutputField
              token={to}
              value={bdv}
            />
            <Stack direction="row" gap={1} justifyContent="center">
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={STALK}
                  value={stalk}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={SEEDS}
                  value={seeds}
                />
              </Box>
            </Stack>
          </Stack>
        ) : null}
        <Button disabled type="submit" size="large" fullWidth>
          Deposit
        </Button>
      </Stack>
    </Form>
  );
};

const Deposit : React.FC<{
  to: Token;
  // poolState: BeanPoolState;
}> = ({
  to,
  // poolState,
}) => {
  const Bean = useChainConstant(BEAN);
  const initialValues : DepositFormValues = useMemo(() => ({
    tokens: [
      {
        token: Bean,
        amount: undefined,
      },
    ],
  }), [Bean]);

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(props) => <DepositForm to={to} {...props} />}
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
