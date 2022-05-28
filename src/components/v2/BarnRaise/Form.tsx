import React, { useCallback, useMemo } from 'react';
import { Button, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import gearIcon from 'img/gear.svg';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN } from 'util/index';
import { ETH, TokensByAddress, USDC } from 'constants/v2/tokens';
import { BalanceState } from 'state/v2/farmer/balances/reducer';
import TokenInputField from '../Common/Form/TokenInputField';
import PurchaseDropdown from './PurchaseFertilizer/PurchaseDropdown';
import { Form, Formik } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';

export interface BarnraiseFormProps {
  amount: BigNumber;
  handleSetAmount: (val?: string | BigNumber) => void;
  from: NativeToken | ERC20Token;
  handleSetFrom: (val?: any) => void; // TODO: Add type
  erc20TokenList: TokensByAddress<Token> | never[];
  balances: BalanceState;
  account: any;
}

const FertilizeForm : React.FC = () => {
  return (
    <Form noValidate>
      <Stack gap={1}>
      </Stack>
    </Form>
  )
}

type FertilizerFormValues = {
  tokens: ({
    token: Token,
    amount: BigNumber | undefined;
  })[]
}

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

const FormWrapper: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken,
        amount: undefined,
      },
    ],
  }), [baseToken]);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(props) => <DepositForm to={to} {...props} />}
    </Formik>
  );
};

export default FormWrapper;
