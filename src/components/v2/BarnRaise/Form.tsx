import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import gearIcon from 'img/gear.svg';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN } from 'util/index';
import { ETH, USDC } from 'constants/v2/tokens';
import { TokensByAddress } from 'constants/v2';
import { BalanceState } from 'state/v2/farmer/balances/reducer';
import { Form, Formik, FormikProps } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import TokenSelectDialog, { TokenSelectMode } from '../Common/Form/TokenSelectDialog';
import TokenQuoteProvider from '../Common/Form/TokenQuoteProvider';
import useChainConstant from 'hooks/useChainConstant';
import useFarmerReady from 'hooks/useFarmerReady';

// ---------------------------------------------------
export interface BarnraiseFormProps {
  amount: BigNumber;
  handleSetAmount: (val?: string | BigNumber) => void;
  from: NativeToken | ERC20Token;
  handleSetFrom: (val?: any) => void; // TODO: Add type
  erc20TokenList: TokensByAddress<Token> | never[];
  balances: BalanceState;
  account: any;
}

type FertilizerFormValues = {
  tokens: ({
    token: Token,
    amount: BigNumber | undefined;
  })[]
}

// ---------------------------------------------------

const PREFERRED_TOKENS : PreferredToken[] = [
  {
    token: USDC,
    minimum: new BigNumber(1),    // $1
  },
  {
    token: ETH,
    minimum: new BigNumber(0.001) // ~$2-4
  }
]

// ---------------------------------------------------

const FertilizeForm : React.FC<
  FormikProps<FertilizerFormValues>
> = ({
  // Formik
  values,
  setFieldValue,
}) => {
  const tokenList = useTokenMap(
    useMemo(() => ([USDC, ETH]), [])
  );
  const Usdc = useChainConstant(USDC);
  const balances = useFarmerBalances();
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  // console.debug('[DepositForm] render');
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    setFieldValue(
      'tokens',
      Array.from(_tokens).map((token) => ({ token, amount: undefined }))
    );
  }, [setFieldValue]);

  return (
    <Form noValidate>
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={tokenList}
          mode={TokenSelectMode.SINGLE}
        />
        <Stack gap={1.5}>
          {values.tokens.map((state, index) => (
            <TokenQuoteProvider
              name={`tokens.${index}`}
              tokenOut={Usdc}
              balance={balances[state.token.address] || undefined}
              state={state}
              showTokenSelect={handleOpen}
            />
          ))}
        </Stack>
      </Stack>
    </Form>
  )
}

// ---------------------------------------------------

const SetupForm: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken,
        amount: undefined,
      },
    ],
  }), [baseToken]);
  console.debug(`[FormWrapper] render with baseToken ${baseToken}`);
  return (
    <Card>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {(props) => <FertilizeForm {...props} />}
      </Formik>
    </Card>
  );
};

export default () => {
  const isReady = useFarmerReady();

  if (isReady) {
    return <SetupForm />
  }

  return <div>Setting up....</div>
};
