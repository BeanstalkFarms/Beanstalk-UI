import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { displayBN, displayFullBN, tokenResult, toStringBaseUnitBN } from 'util/index';
import { BEAN, BEAN_CRV3_LP, ETH, ETH_DECIMALS, USDC } from 'constants/tokens';
import { CURVE_ZAP_ADDRESSES, TokenMap } from 'constants/index';
import { FarmerBalances } from 'state/farmer/balances';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract, useFertilizerContract } from 'hooks/useContract';
import useFertilizerSummary from 'hooks/summary/useFertilizerSummary';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import { FormState } from 'components/Common/Form';
import TxnPreview from 'components/Common/Form/TxnPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { useFetchFarmerFertilizer } from 'state/farmer/fertilizer/updater';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import { useFetchFarmerAllowances } from 'state/farmer/allowances/updater';
import { timeToStringDetailed } from 'util/Time';
import useChainId from 'hooks/useChain';
import { REPLANTED_CHAINS, SupportedChainId } from 'constants/chains';
import { BUY_FERTILIZER } from 'components/Barn/FertilizerItemTooltips';
import { QuoteHandler } from 'hooks/useQuote';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import TransactionToast from 'components/Common/TxnToast';
import FertilizerItem from './FertilizerItem';
import { BeanstalkReplanted } from 'generated';
import { getChainConstant } from 'util/Chain';
import Farm from 'lib/Beanstalk/Farm';
import { optimizeFromMode } from 'util/Farm';

// ---------------------------------------------------
export interface BarnraiseFormProps {
  amount: BigNumber;
  handleSetAmount: (val?: string | BigNumber) => void;
  from: NativeToken | ERC20Token;
  handleSetFrom: (val?: any) => void; // TODO: Add type
  erc20TokenList: TokenMap<Token> | never[];
  balances: FarmerBalances;
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
    handleQuote: QuoteHandler;
    balances: FarmerBalances;
    tokenOut: ERC20Token;
  }
> = ({
  // Formik
  values,
  setFieldValue,
  isSubmitting,
  // Custom
  contract,
  handleQuote,
  balances,
  tokenOut: token
}) => {
  const tokenMap = useTokenMap<ERC20Token | NativeToken>(TOKEN_LIST);
  const [showTokenSelect, setShowTokenSelect] = useState(false);  
  const { usdc, fert, humidity, actions } = useFertilizerSummary(values.tokens);

  // Extract
  const isValid = fert?.gt(0);

  // Handlers
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    setFieldValue(
      'tokens',
      Array.from(_tokens).map((t) => ({ token: t, amount: null }))
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
              tokenOut={token}
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
                  <TxnPreview
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
          Buy{fert && fert.gt(0) && ` ${displayBN(fert)}`} Fertilizer
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SetupForm: React.FC<{}> = () => {
  // Wallet connection
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const chainId = useChainId();

  // Farmer data
  const balances = useFarmerBalances();

  // Data refreshing
  const [refetchFertilizer] = useFetchFarmerFertilizer();
  const [refetchBalances]   = useFetchFarmerBalances();
  const [refetchAllowances] = useFetchFarmerAllowances();
  
  // Contracts
  const fertContract = useFertilizerContract(signer);
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);

  // Constants
  const Usdc = getChainConstant(USDC, chainId);
  const Eth  = getChainConstant(ETH,  chainId);
  const BeanCrv3 = getChainConstant(BEAN_CRV3_LP, chainId);
  const Zap  = getChainConstant(CURVE_ZAP_ADDRESSES, chainId);
  const isReplanted = REPLANTED_CHAINS.has(chainId);
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const tokenOut = Usdc;

  //
  const initialValues : FertilizerFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: null,
      },
    ],
  }), [baseToken]);

  // Doesn't get called if tokenIn === tokenOut
  const handleQuote = useCallback<QuoteHandler>((tokenIn, amountIn) => 
    fertContract.callStatic.getUsdcOut(
      tokenIn.stringify(amountIn)
    ).then(tokenResult(BEAN)),
  [fertContract]);

  const onSubmit = useCallback(async (values: FertilizerFormValues, formActions: FormikHelpers<FertilizerFormValues>) => {
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

      const txToast = new TransactionToast({
        loading: `Buying ${displayFullBN(amountUsdc, Usdc.displayDecimals)} FERT`,
        success: 'Success!',
      });

      let call;
      // Once Replanted we need to use the Farm function
      // to acquire USDC (if necessary) and buy Fertilizer.
      if (isReplanted) {
        switch (token) {
          case Eth:
            //
            break;
          case Usdc:
            call = beanstalk.mintFertilizer(
              Usdc.stringify(amountUsdc),
              await farm.contracts.curve.zap.calc_token_amount(
                farm.contracts.curve.pools.beanCrv3.address,
                [
                  // 0.866616 is the ratio to add USDC/Bean at such that post-exploit
                  // delta B in the Bean:3Crv pool with A=1 equals the pre-export 
                  // total delta B times the haircut. Independent of the haircut %.
                  Usdc.stringify(amountUsdc.times(0.866616)),
                  0,
                  Usdc.stringify(amountUsdc),
                  0
                ],
                true
              ),
              optimizeFromMode(amountUsdc, balances[tokenOut.address])
            );
            break;
          default:
            call = Promise.reject(new Error('Unrecognized token.'));
            break;
        }
      }

      // Beanstalk pre-Replant but post-BR launch used the below
      // methods directly from the Fertilizer ERC1155 contract.
      else {
        switch(token) {
          case Eth:
            call = fertContract.buyAndMint(
              toStringBaseUnitBN(amountUsdc.multipliedBy(0.999), Usdc.decimals),
              { value: toStringBaseUnitBN(amount, Eth.decimals) }
            );
            break;
          case Usdc:
            call = fertContract.mint(
              toStringBaseUnitBN(amountUsdc, Usdc.decimals),
            );
            break;
          default:
            call = Promise.reject(new Error('Unrecognized token.'));
            break;
        }
      }

      if (!call) throw new Error('No supported purchase method.');

      return call
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
          formActions.resetForm();
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
    balances,
    beanstalk,
    farm,
    isReplanted,
    tokenOut,
    fertContract,
    account?.address,
    refetchFertilizer,
    refetchBalances,
    refetchAllowances
  ]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h2">Buy Fertilizer</Typography>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {(formikProps) => (
            <FertilizeForm
              handleQuote={handleQuote}
              contract={fertContract}
              balances={balances}
              tokenOut={tokenOut}
              {...formikProps}
            />
          )}
        </Formik>
      </Stack>
    </Card>
  );
};

export default SetupForm;

// ---------------------------------------------------

// const launch = 1654531200 * 1000; // June 6th, 2022 12pm EST
// const getDiff = () => (launch - new Date().getTime()) / 1000;

// export default () => {
//   const chainId = useChainId();
//   const [timeStr, setTimeStr] = useState('Loading...');
//   const [isLaunched, setIsLaunched] = useState(chainId !== SupportedChainId.MAINNET); 
//   useEffect(() => {
//     if (!isLaunched && chainId === SupportedChainId.MAINNET) {
//       const interval = setInterval(() => {
//         const diff = getDiff();
//         if (Math.floor(diff) <= 0) {
//           setIsLaunched(true);
//         }
//         setTimeStr(timeToStringDetailed(diff));
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [isLaunched, chainId]);

//   if (isLaunched) return <SetupForm />;
//   return (
//     <Card component={Stack} gap={0.5} alignItems="center" sx={{ p: 2 }}>
//       <Typography color="text.secondary">The Barn Raise begins in</Typography>
//       <Typography variant="h2">{timeStr}</Typography>
//     </Card>
//   );
// };
