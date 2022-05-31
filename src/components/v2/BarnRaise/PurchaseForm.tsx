import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import toast from 'react-hot-toast';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN, displayFullBN, toStringBaseUnitBN } from 'util/index';
import { ETH, USDC } from 'constants/v2/tokens';
import { TokensByAddress } from 'constants/v2';
import { BalanceState } from 'state/v2/farmer/balances/reducer';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
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
import { FormState } from 'components/v2/Common/Form';
import TransactionPreview from 'components/v2/Common/Form/TransactionPreview';
import TxnAccordion from 'components/v2/Common/TxnAccordion';
import { ethers } from 'ethers';
import { useFetchFarmerFertilizer } from 'state/v2/farmer/fertilizer/updater';
import { useAccount } from 'wagmi';
import { useFetchFarmerBalances } from 'state/v2/farmer/balances/updater';
import { useFetchFarmerAllowances } from 'state/v2/farmer/allowances/updater';
import FertilizerItem from './FertilizerItem';
import SmartSubmitButton from '../Common/Form/SmartSubmitButton';
import TransactionToast from '../Common/TxnToast';

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
      Array.from(_tokens).map((token) => ({ token, amount: null }))
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
        {/* Form Contents */}
        <Box>
          {/* Inputs */}
          {values.tokens.map((state, index) => (
            <TokenQuoteProvider
              key={state.token.address}
              name={`tokens.${index}`}
              tokenOut={Usdc}
              balance={balances[state.token.address] || undefined}
              state={state}
              showTokenSelect={handleOpen}
            />
          ))}
          {/* Outputs */}
          {usdc?.gt(0) ? (
            <Stack direction="column" gap={1} alignItems="center" justifyContent="center">
              <KeyboardArrowDownIcon color="secondary" />
              <Box sx={{ width: 180, pb: 1 }}>
                <FertilizerItem
                  isNew
                  amount={usdc}
                  remaining={usdc.multipliedBy(humidity.plus(1))}
                  humidity={humidity}
                  state="active"
                />
              </Box>
              <Box sx={{ width: '100%', mt: 0 }}>
                <TxnAccordion defaultExpanded={false}>
                  <TransactionPreview
                    actions={actions}
                  />
                </TxnAccordion>
              </Box>
            </Stack>
          ) : null}
        </Box>
        {/* Submit */}
        <SmartSubmitButton
          mode="auto"
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
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SetupForm: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const [fertContract] = useBeanstalkFertilizerContract();
  const { data: account } = useAccount();
  const Usdc = useChainConstant(USDC);
  const Eth  = useChainConstant(ETH);
  const [refetchFertilizer] = useFetchFarmerFertilizer();
  const [refetchBalances]   = useFetchFarmerBalances();
  const [refetchAllowances] = useFetchFarmerAllowances();

  //
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken,
        amount: null,
      },
    ],
  }), [baseToken]);
  const onSubmit = useCallback((values: FertilizerFormValues, actions: FormikHelpers<FertilizerFormValues>) => {
    if (fertContract && account?.address) {
      const token   = values.tokens[0].token;
      const amount  = values.tokens[0].amount;
      const amountUsdc = (
        token === Eth
          ? values.tokens[0].amountOut
          : values.tokens[0].amount
      );

      if (!amount || !amountUsdc) {
        toast.error('An error occurred.');
        return;
      }

      //
      const txToast = new TransactionToast({
        loading: `Buying ${displayFullBN(amountUsdc, Usdc.displayDecimals)} FERT`,
        success: 'Success!',
      });

      // Build call
      let call;
      if (token === Eth) {
        call = fertContract.buyAndMint(
          toStringBaseUnitBN(amountUsdc, Usdc.decimals),
          { value: toStringBaseUnitBN(amount, Eth.decimals) }
        );
      } else if (token === Usdc) {
        call = fertContract.mint(
          toStringBaseUnitBN(amountUsdc, Usdc.decimals),
        );
      } else {
        call = Promise.reject(new Error('Unrecognized token.'));
      }

      return call
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
          actions.resetForm();
          refetchFertilizer(account.address as string);
          refetchBalances(account.address as string);
          refetchAllowances(account.address as string, fertContract.address, Usdc);
        })
        .catch((err) => {
          txToast.error(err);
        });
    }
  }, [
    Eth,
    Usdc,
    fertContract,
    account?.address,
    refetchFertilizer,
    refetchBalances,
    refetchAllowances
  ]);

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
