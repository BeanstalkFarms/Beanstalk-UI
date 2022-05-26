import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Card, CircularProgress, Divider, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import debounce from 'lodash/debounce';
import groupBy from 'lodash/groupBy';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { FieldArray, Form, Formik, FormikProps, useFormikContext } from 'formik';
import InputField from 'components/v2/Common/Form/InputField';
import TokenAdornment from 'components/v2/Common/Form/TokenAdornment';
import TokenSelectDialog from 'components/v2/Common/Form/TokenSelectDialog';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN, displayTokenAmount, toTokenUnitsBN } from 'util/TokenUtilities';
import { zeroBN } from 'constants/index';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/v2/Common/Accordion/AccordionSummary';

type DepositFormValues = {
  tokens: ({
    token: Token;
    // amount?: number;
    amount?: BigNumber;
    amountOut?: BigNumber;
    quoting?: boolean;
  })[]
}

enum InstructionType {
  SWAP,
  DEPOSIT,
  RECEIVE_REWARDS,
}

type SwapInstruction = {
  type: InstructionType.SWAP;
  tokenIn: Token;
  amountIn: BigNumber;
  tokenOut: Token;
  amountOut: BigNumber;
}

type RewardsInstruction = {
  type: InstructionType.RECEIVE_REWARDS;
  stalk: BigNumber;
  seeds: BigNumber;
}

type DepositInstruction = {
  type: InstructionType.DEPOSIT;
  amountIn: BigNumber;
  tokenIn: Token;
}

type Instruction = (
  SwapInstruction
  | DepositInstruction
  | RewardsInstruction
);

const INSTRUCTION_MESSAGES = {
  [InstructionType.SWAP]: (i: SwapInstruction) => 
    `Swap ${displayTokenAmount(i.amountIn, i.tokenIn)} for ${displayTokenAmount(i.amountOut, i.tokenOut)}.`,
  [InstructionType.DEPOSIT]: (i: DepositInstruction) =>
    `Deposit ${displayTokenAmount(i.amountIn, i.tokenIn)} into the Silo.`,
  [InstructionType.RECEIVE_REWARDS]: (i: RewardsInstruction) =>
    `Receive ${displayFullBN(i.stalk, 2)} Stalk and ${displayFullBN(i.seeds, 2)} Seeds.`,
};

const parseInstruction = (i: Instruction) => INSTRUCTION_MESSAGES[i.type as keyof typeof INSTRUCTION_MESSAGES](i);

// amount of beans to buy with non-bean tokens, based on each token.amount -> bean conversion
// -> the exchange rate for each token -> bean
// existing beans to use
//
// stalk = 1*BDV if token = any,
// seeds = 2*BDV if token = Bean, 4*BDV if token = BeanEthLP
//
// need to update each token only when its value changes
const useDepositSummary = (to: Token, tokens: DepositFormValues['tokens']) => {
  const summary = tokens.reduce((agg, curr) => {
    const amount = (
      curr.token === to
        ? curr.amount
        : curr.amountOut
    );
    if (amount) {
      // BDV
      agg.bdv   = agg.bdv.plus(amount);
      // Rewards
      // NOTE: this is a function of `to.rewards.stalk` for the destination token.
      // we could pull it outside the reduce function.
      // however I expect we may need to adjust this when doing withdrawals/complex swaps
      // when bdv does not always go up during an Instruction. -SC
      agg.stalk = agg.stalk.plus(amount.times(to.rewards?.stalk || 0));
      agg.seeds = agg.seeds.plus(amount.times(to.rewards?.seeds || 0));
      // Instructions
      if (curr.amount && curr.amountOut) {
        agg.instructions.push({
          type: InstructionType.SWAP,
          tokenIn: curr.token,
          tokenOut: to,
          amountIn: curr.amount,
          amountOut: curr.amountOut,
        });
      }
    }
    return agg;
  }, {  
    bdv: zeroBN,
    stalk: zeroBN,
    seeds: zeroBN,
    instructions: [] as Instruction[],
  });

  summary.instructions.push({
    type: InstructionType.DEPOSIT,
    amountIn: summary.bdv,
    tokenIn: to,
  });
  summary.instructions.push({
    type: InstructionType.RECEIVE_REWARDS,
    stalk: summary.stalk,
    seeds: summary.seeds,
  });

  return summary;
};

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

const TokenQuoteField : React.FC<{
  name: string;
  balance: BigNumber | undefined;
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

  // Run getAmountOut whenever the amount changes.
  // NOTE: because the getAmountOut function is debounced,
  // it returns undefined in some cases, so instead we 
  // listen for changes to `amountOut` and `quouting`
  // via effects and update form state accordingly.
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

  // Memoized token adornment
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={data.token}
        onClick={showTokenSelect}
      />
    )
  }), [data.token, showTokenSelect]);

  // Render info about the quote beneath the input.
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

const TokenIcon : React.FC<{ token: Token }> = ({ token }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    style={{
      height: '100%'
    }}
  />
);

const TransactionStep : React.FC<{
  type: InstructionType;
  instructions: Instruction[];
  highlighted: InstructionType | undefined;
}> = ({
  type, 
  instructions,
  highlighted,
}) => (
  <Box sx={{
    background: 'white',
    // minWidth: '40px',
    // textAlign: 'center',
    height: '100%', // of TXN_PREVIEW_HEIGHT
    // outline: '1px solid red',
    py: 0.5,
    px: 0.5,
  }}>
    <Box
      display="inline-block"
      sx={(highlighted === undefined || highlighted === type) 
        ? {
          height: '100%',
          // backgroundColor: 'primary'
        } 
        : {
          height: '100%',
          opacity: 0.2,
        }
      }
    >
      {type === InstructionType.SWAP && (
        (instructions as SwapInstruction[]).map((instr) => (
          <img
            key={instr.tokenIn.address}
            src={instr.tokenIn.logo}
            alt={instr.tokenIn.name}
            style={{ height: '100%' }}
          />
        ))
      )}
      {type === InstructionType.DEPOSIT && (
        (instructions as DepositInstruction[]).map((instr) => (
          <img
            key={instr.tokenIn.address}
            src={instr.tokenIn.logo}
            alt={instr.tokenIn.name}
            style={{ height: '100%' }}
          />
        ))
      )}
      {type === InstructionType.RECEIVE_REWARDS && (
        <>
          <TokenIcon token={STALK} />
          <TokenIcon token={SEEDS} />
        </>
      )}
    </Box>
  </Box>
);

const EXECUTION_STEPS = [
  InstructionType.SWAP,
  InstructionType.DEPOSIT,
  InstructionType.RECEIVE_REWARDS,
];

const TXN_PREVIEW_HEIGHT = 35;
const TXN_PREVIEW_LINE_WIDTH = 5;

const TransactionPreview : React.FC<{ instructions: Instruction[] }> = ({ instructions }) => {
  const instructionsByType = useMemo(() => groupBy(instructions, 'type'), [instructions]);
  const [highlighted, setHighlighted] = useState<InstructionType | undefined>(undefined);

  return (
    <Stack gap={2}>
      <Box sx={{
        position: 'relative',
        height: `${TXN_PREVIEW_HEIGHT}px`,
      }}>
        <Divider
          sx={{
            borderBottomStyle: 'dotted',
            borderBottomWidth: TXN_PREVIEW_LINE_WIDTH,
            width: '100%',
            position: 'absolute',
            left: 0,
            top: TXN_PREVIEW_HEIGHT / 2 - TXN_PREVIEW_LINE_WIDTH / 2,
            zIndex: 1,
          }}
        />
        <Box sx={{
          position: 'relative',
          zIndex: 2,      // above the Divider
          height: '100%'  // of TXN_PREVIEW_HEIGHT
        }}>
          <Stack 
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              height: '100%' // of TXN_PREVIEW_HEIGHT
            }}
          >
            {EXECUTION_STEPS.map((step) => (
              instructionsByType[step] ? (
                <TransactionStep
                  key={step}
                  type={step}
                  instructions={instructionsByType[step]}
                  highlighted={highlighted}
                /> 
              ) : null 
            ))}
          </Stack>
        </Box>
      </Box>
      <Stack>
        {instructions.map((instr, index) => (
          <Box
            sx={{
              py: 0.5,
              opacity: (highlighted === undefined || instr.type === highlighted) ? 1 : 0.3,
              cursor: 'pointer'
            }}
            key={index}
            onMouseOver={() => setHighlighted(instr.type)}
            onMouseOut={() => setHighlighted(undefined)}
            onFocus={() => setHighlighted(instr.type)}
            onBlur={() => setHighlighted(undefined)}
          >
            <Typography color="grey[300]">
              {parseInstruction(instr)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
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
  const { bdv, stalk, seeds, instructions } = useDepositSummary(to, values.tokens);

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
                  <TokenQuoteField
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
            <Box>
              <Accordion defaultExpanded variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TransactionPreview
                    instructions={instructions}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
        ) : null}
        <Button disabled type="submit" size="large" fullWidth>
          Deposit
        </Button>
      </Stack>
    </Form>
  );
};

const Deposit : React.FC<{ to: Token; }> = ({ to }) => {
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
  // poolState: BeanPoolState;
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
              // poolState={props.poolState}
            />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
