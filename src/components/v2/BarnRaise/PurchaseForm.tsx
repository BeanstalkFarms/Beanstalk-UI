import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN, toStringBaseUnitBN } from 'util/index';
import { ETH, USDC } from 'constants/v2/tokens';
import { TokensByAddress } from 'constants/v2';
import { BalanceState } from 'state/v2/farmer/balances/reducer';
import { Form, Formik, FormikProps } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import useChainConstant from 'hooks/useChainConstant';
import useFarmerReady from 'hooks/useFarmerReady';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useBeanstalkFertilizerContract } from 'hooks/useContract';
import useFertilizerSummary from 'hooks/summary/useFertilizerSummary';
import TokenSelectDialog, { TokenSelectMode } from 'components/v2/Common/Form/TokenSelectDialog';
import TokenQuoteProvider from 'components/v2/Common/Form/TokenQuoteProvider';
import { FormState, FormTokenState } from 'components/v2/Common/Form';
import TransactionPreview from 'components/v2/Common/Form/TransactionPreview';
import TxnAccordion from 'components/v2/Common/TxnAccordion';
import FertilizerItem from './FertilizerItem';
import SmartSubmitButton from '../Common/Form/SmartSubmitButton';
import { BeanstalkFertilizer } from 'constants/generated';
import { ethers } from 'ethers';

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

type FertilizerFormValues = FormState;

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
];

// ---------------------------------------------------

const FertilizeForm : React.FC<
  FormikProps<FertilizerFormValues>
  & {
    contract: ethers.Contract;
  }
> = ({
  // Formik
  values,
  setFieldValue,
  isSubmitting,
  contract,
}) => {
  const tokenList = useTokenMap(useMemo(() => ([USDC, ETH]), []));
  const Usdc = useChainConstant(USDC);
  const balances = useFarmerBalances();
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  
  // 
  const {
    usdc,
    humidity,
    actions
  } = useFertilizerSummary(values.tokens);

  // Extract
  const ready = usdc?.gt(0);

  // Handlers
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
      <Stack gap={2}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={tokenList}
          mode={TokenSelectMode.SINGLE}
        />
        {/* Form Contents */}
        <Box>
          {/* Inputs */}
          {values.tokens.map((state, index) => (
            <TokenQuoteProvider
              name={`tokens.${index}`}
              tokenOut={Usdc}
              balance={balances[state.token.address] || undefined}
              state={state}
              showTokenSelect={handleOpen}
            />
          ))}
          {/* Outputs */}
          {usdc?.gt(0) ? (
            <>
              <Stack direction="column" gap={2} alignItems="center" justifyContent="center">
                <KeyboardArrowDownIcon color="secondary" />
                <Box>
                  <Box sx={{ width: 200 }}>
                    <FertilizerItem
                      isNew
                      amount={usdc}
                      remaining={usdc.multipliedBy(humidity.plus(1))}
                      humidity={humidity}
                      state="active"
                    />
                  </Box>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TxnAccordion>
                    <TransactionPreview
                      actions={actions}
                    />
                  </TxnAccordion>
                </Box>
              </Stack>
            </>
          ) : null}
        </Box>
        {/* Submit */}
        <SmartSubmitButton
          // Button props
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          loading={isSubmitting}
          disabled={!ready}
          // Smart props
          contract={contract}
          tokens={values.tokens}
        >
          Purchase{usdc && usdc.gt(0) && ` ${displayBN(usdc)}`} Fertilizer
        </SmartSubmitButton>
        
        {/* <LoadingButton
          loading={isSubmitting}
          type="submit"
          disabled={!ready}
          variant="contained"
          color="primary"
          size="large"
        >
          Purchase{usdc && usdc.gt(0) && ` ${displayBN(usdc)}`} Fertilizer
        </LoadingButton> */}
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SetupForm: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const fertContract = useBeanstalkFertilizerContract();
  const Usdc = useChainConstant(USDC);
  const Eth  = useChainConstant(ETH);
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken,
        amount: undefined,
      },
    ],
  }), [baseToken]);
  const onSubmit = useCallback((values: FertilizerFormValues) => {
    if (fertContract) {
      const token   = values.tokens[0].token;
      const amount  = values.tokens[0].amount;
      const amountUsdc = token === Eth ? values.tokens[0].amountOut :  values.tokens[0].amount;
      let call;
      if (amount && amountUsdc) {
        if (token === Eth) {
          call = fertContract.buyAndMint(
            toStringBaseUnitBN(amountUsdc.multipliedBy(0.999), Usdc.decimals),
            { value: toStringBaseUnitBN(amount, Eth.decimals) }
          );
        } else if (token === Usdc) {
          call = Promise.resolve();
        } else {
          call = Promise.reject();
        }
      } else {
        call = Promise.reject();
      }
      return call.then();
    }
  }, [Eth, Usdc, fertContract]);
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h2">Purchase Fertilizer</Typography>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {(props) => <FertilizeForm contract={fertContract} {...props} />}
        </Formik>
      </Stack>
    </Card>
  );
};

// ---------------------------------------------------

export default () => {
  const isReady = useFarmerReady();
  if (isReady) return <SetupForm />;
  return <div>Setting up....</div>;
};
