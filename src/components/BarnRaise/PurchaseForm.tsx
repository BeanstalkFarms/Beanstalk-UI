import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import toast from 'react-hot-toast';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN, displayFullBN, toStringBaseUnitBN } from 'util/index';
import { ETH, ETH_DECIMALS, USDC } from 'constants/tokens';
import { TokenMap } from 'constants/index';
import { BalanceState } from 'state/farmer/balances/reducer';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import useChainConstant from 'hooks/useChainConstant';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useFertilizerContract } from 'hooks/useContract';
import useFertilizerSummary from 'hooks/summary/useFertilizerSummary';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import { FormState } from 'components/Common/Form';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { ethers } from 'ethers';
import { useFetchFarmerFertilizer } from 'state/farmer/fertilizer/updater';
import { useAccount, useSigner } from 'wagmi';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import { useFetchFarmerAllowances } from 'state/farmer/allowances/updater';
import { timeToStringDetailed } from 'util/Time';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { BUY_FERTILIZER } from 'components/BarnRaise/FertilizerItemTooltips';
import { QuoteHandler } from 'hooks/useQuote';
import { bigNumberResult } from 'util/Ledger';
import FertilizerItem from './FertilizerItem';
import SmartSubmitButton from '../Common/Form/SmartSubmitButton';
import TransactionToast from '../Common/TxnToast';

// ---------------------------------------------------
export interface BarnraiseFormProps {
  amount: BigNumber;
  handleSetAmount: (val?: string | BigNumber) => void;
  from: NativeToken | ERC20Token;
  handleSetFrom: (val?: any) => void; // TODO: Add type
  erc20TokenList: TokenMap<Token> | never[];
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

const TOKEN_LIST = [USDC, ETH];

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
  const tokenMap = useTokenMap(TOKEN_LIST);
  const Usdc = useChainConstant(USDC);
  const balances = useFarmerBalances();
  const [showTokenSelect, setShowTokenSelect] = useState(false);  
  const fertContract = useFertilizerContract();
  const { usdc, fert, humidity, actions } = useFertilizerSummary(values.tokens);

  // Extract
  const isValid = fert?.gt(0);

  // Handlers
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    setFieldValue(
      'tokens',
      Array.from(_tokens).map((token) => ({ token, amount: null }))
    );
  }, [setFieldValue]);
  const handleQuote = useCallback<QuoteHandler>((tokenIn, amountIn, tokenOut) => fertContract.callStatic.getUsdcOut(
      toStringBaseUnitBN(amountIn, ETH_DECIMALS),
    ).then(bigNumberResult), [fertContract]);

  return (
    <Form noValidate>
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={Object.values(tokenMap)}
          mode={TokenSelectMode.SINGLE}
        />
        {/* Form Contents */}
        <Box>
          {/* Inputs */}
          {values.tokens.map((state, index) => (
            <TokenQuoteProvider
              key={state.token.address}
              name={`tokens.${index}`}
              state={state}
              tokenOut={Usdc}
              balance={balances[state.token.address] || undefined}
              showTokenSelect={handleOpen}
              handleQuote={handleQuote}
            />
          ))}
          {/* Outputs */}
          {fert?.gt(0) ? (
            <Stack direction="column" gap={1} alignItems="center" justifyContent="center">
              <KeyboardArrowDownIcon color="secondary" />
              <Box sx={{ width: 250, pb: 1 }}>
                <FertilizerItem
                  isNew
                  amount={fert}
                  remaining={fert.multipliedBy(humidity.plus(1))}
                  humidity={humidity}
                  state="active"
                  tooltip={BUY_FERTILIZER}
                />
              </Box>
              <Box sx={{ width: '100%', mt: 0 }}>
                <TxnAccordion defaultExpanded={false}>
                  <TransactionPreview
                    actions={actions}
                  />
                  <Divider sx={{ my: 2, opacity: 0.4 }} />
                  <Box>
                    <Typography>Note: The amount of FERT received rounds down to the nearest USDC. {usdc?.toFixed(2)} USDC = {fert?.toFixed(0)} FERT.</Typography>
                  </Box>
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
          disabled={!isValid}
          // Smart props
          contract={contract}
          tokens={values.tokens}
        >
          Purchase{fert && fert.gt(0) && ` ${displayBN(fert)}`} Fertilizer
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SetupForm: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const { data: account } = useAccount();
  const Usdc = useChainConstant(USDC);
  const Eth  = useChainConstant(ETH);
  const [refetchFertilizer] = useFetchFarmerFertilizer();
  const [refetchBalances]   = useFetchFarmerBalances();
  const [refetchAllowances] = useFetchFarmerAllowances();
  const { data: signer } = useSigner();
  const fertContract = useFertilizerContract(signer);

  //
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken,
        amount: null,
      },
    ],
  }), [baseToken]);

  //
  const onSubmit = useCallback((values: FertilizerFormValues, actions: FormikHelpers<FertilizerFormValues>) => {
    if (fertContract && account?.address) {
      const token   = values.tokens[0].token;
      const amount  = values.tokens[0].amount;
      const amountUsdc = (
        token === Eth
          ? values.tokens[0].amountOut
          : values.tokens[0].amount
      )?.dp(0, BigNumber.ROUND_DOWN);

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
          toStringBaseUnitBN(amountUsdc.multipliedBy(0.999), Usdc.decimals),
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
    return Promise.resolve();
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

const launch = 1654531200 * 1000; // June 6th, 2022 12pm EST
const getDiff = () => (launch - new Date().getTime()) / 1000;

export default () => {
  const chainId = useChainId();
  const [timeStr, setTimeStr] = useState('Loading...');
  const [isLaunched, setIsLaunched] = useState(chainId !== SupportedChainId.MAINNET); 
  useEffect(() => {
    if (!isLaunched && chainId === SupportedChainId.MAINNET) {
      const interval = setInterval(() => {
        const diff = getDiff();
        if (Math.floor(diff) <= 0) {
          setIsLaunched(true);
        }
        setTimeStr(timeToStringDetailed(diff));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLaunched, chainId]);

  if (isLaunched) return <SetupForm />;
  return (
    <Card component={Stack} gap={0.5} alignItems="center" sx={{ p: 2 }}>
      <Typography color="text.secondary">The Barn Raise begins in</Typography>
      <Typography variant="h2">{timeStr}</Typography>
    </Card>
  );
};
