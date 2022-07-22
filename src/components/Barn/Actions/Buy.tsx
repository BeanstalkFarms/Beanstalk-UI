import React, { useCallback, useMemo, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { Token } from 'classes';
import { ERC20Token, NativeToken } from 'classes/Token';
import { BEAN, ETH, USDC, USDT, WETH } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import { FarmerBalances } from 'state/farmer/balances';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import { useBeanstalkContract, useFertilizerContract } from 'hooks/useContract';
import useFertilizerSummary from 'hooks/summary/useFertilizerSummary';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import { FormState } from 'components/Common/Form';
import TxnPreview from 'components/Common/Form/TxnPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { useFetchFarmerBarn } from 'state/farmer/barn/updater';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import { useFetchFarmerAllowances } from 'state/farmer/allowances/updater';
import useChainId from 'hooks/useChain';
import { REPLANTED_CHAINS } from 'constants/chains';
import { BUY_FERTILIZER } from 'components/Barn/FertilizerItemTooltips';
import { QuoteHandler } from 'hooks/useQuote';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import TransactionToast from 'components/Common/TxnToast';
import { displayBN, displayFullBN, tokenResult, toStringBaseUnitBN, toTokenUnitsBN, parseError, getChainConstant } from 'util/index';
import { BeanstalkReplanted } from 'generated';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import FertilizerItem from '../FertilizerItem';

// ---------------------------------------------------

type BuyFormValues = FormState;

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

const BuyForm : React.FC<
  FormikProps<BuyFormValues>
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

const Buy : React.FC<{}> = () => {
  // Wallet connection
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const chainId = useChainId();

  // Farmer data
  const balances = useFarmerBalances();

  // Data refreshing
  const [refetchFertilizer] = useFetchFarmerBarn();
  const [refetchBalances]   = useFetchFarmerBalances();
  const [refetchAllowances] = useFetchFarmerAllowances();
  
  // Contracts
  const fertContract = useFertilizerContract(signer);
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);

  // Constants
  const Usdc = getChainConstant(USDC, chainId);
  const Eth  = getChainConstant(ETH,  chainId);
  const Weth = getChainConstant(WETH, chainId);
  const Usdt = getChainConstant(USDT, chainId);
  const isReplanted = REPLANTED_CHAINS.has(chainId);
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const tokenOut = Usdc;
  
  /// Will need approval to use USDC; contract to approve
  /// varies depending on if we're replanted
  const contract = isReplanted ? beanstalk : fertContract;
  
  const initialValues : BuyFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: undefined,
      },
    ],
  }), [baseToken]);

  // Doesn't get called if tokenIn === tokenOut
  // aka if the user has selected USDC as input
  const handleQuote = useCallback<QuoteHandler>(async (_tokenIn, _amountIn, _tokenOut) => {
    if (!isReplanted) {
      return fertContract.callStatic.getUsdcOut(
        _tokenIn.stringify(_amountIn)
      ).then(tokenResult(BEAN));
    }

    const estimate = await Farm.estimate([
      // WETH -> USDT
      farm.exchange(
        farm.contracts.curve.pools.tricrypto2.address,
        farm.contracts.curve.registries.cryptoFactory.address,
        Weth.address,
        Usdt.address,
        FarmFromMode.INTERNAL,
        FarmToMode.INTERNAL,
      ),
      // USDT -> USDC
      farm.exchange(
        farm.contracts.curve.pools.pool3.address,
        farm.contracts.curve.registries.poolRegistry.address,
        Usdt.address,
        Usdc.address,
        FarmFromMode.INTERNAL_TOLERANT,
        FarmToMode.INTERNAL,
      )
    ], [
      ethers.BigNumber.from(
        toStringBaseUnitBN(_amountIn, _tokenIn.decimals)
      )
    ]);

    return {
      amountOut: toTokenUnitsBN(estimate.amountOut.toString(), _tokenOut.decimals),
      steps: estimate.steps,
    };
  }, [
    Usdc,
    Usdt,
    Weth,
    fertContract,
    farm,
    isReplanted,
  ]);

  const onSubmit = useCallback(async (values: BuyFormValues, formActions: FormikHelpers<BuyFormValues>) => {
    let txToast;
    try {
      if (!fertContract || !beanstalk || !account?.address) throw new Error('Unable to access contracts');

      /// Get amounts
      const token   = values.tokens[0].token;  // input token
      const amount  = values.tokens[0].amount; // input amount (entered into the form)
      const amountUsdc = (
        token === Eth
          ? values.tokens[0].amountOut         // get amount of USDC received for some ETH
          : values.tokens[0].amount            // identity
      )?.dp(0, BigNumber.ROUND_DOWN);

      if (!amount || !amountUsdc) throw new Error('An error occurred.');
    
      txToast = new TransactionToast({
        loading: `Buying ${displayFullBN(amountUsdc, Usdc.displayDecimals)} Fertilizer`,
        success: 'Success!',
      });

      let call;
      let value = ZERO_BN;
      // Once Replanted we need to use the Farm function
      // to acquire USDC (if necessary) and buy Fertilizer.
      if (isReplanted) {
        // Calculate the amount of underlying LP created when minting
        // `amountUsdc` FERT. This holds because 1 FERT = 1 USDC.
        const minLP = await farm.contracts.curve.zap.callStatic.calc_token_amount(
          farm.contracts.curve.pools.beanCrv3.address,
          [
            // 0.866616 is the ratio to add USDC/Bean at such that post-exploit
            // delta B in the Bean:3Crv pool with A=1 equals the pre-export 
            // total delta B times the haircut. Independent of the haircut %.
            Usdc.stringify(amountUsdc.times(0.866616)), // BEAN
            0, // DAI
            Usdc.stringify(amountUsdc), // USDC
            0, // USDT
          ],
          true, // _is_deposit
          { gasLimit: 10000000 }
        );
        switch (token) {
          case Eth: {
            if (!values.tokens[0].steps) throw new Error('No quote found'); // FIXME: standardize this err message across forms
            
            value = value.plus(amount);
            const data : string[] = [
              // Wrap input ETH into our internal balance
              beanstalk.interface.encodeFunctionData('wrapEth', [
                toStringBaseUnitBN(value, Eth.decimals),
                FarmToMode.INTERNAL,
              ]),
              // Swap WETH -> USDC
              ...Farm.encodeStepsWithSlippage(
                values.tokens[0].steps,
                0.1 / 100
              ),
              // Mint Fertilizer, which also mints Beans and 
              // deposits the underlying LP in the same txn.
              beanstalk.interface.encodeFunctionData('mintFertilizer', [
                toStringBaseUnitBN(amountUsdc, 0),
                Farm.slip(minLP, 0.1 / 100),
                FarmFromMode.INTERNAL_TOLERANT,
              ])
            ];
            const gas = await beanstalk.estimateGas.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) });
            console.debug('gas', gas);
            call = beanstalk.farm(data, {
              value: toStringBaseUnitBN(value, Eth.decimals),
              gasLimit: gas.mul(120).div(100)
            });
            break;
          }
          case Usdc: {
            console.debug('[PurchaseForm] purchasing with USDC', {
              address: farm.contracts.curve.pools.beanCrv3.address,
              beanAmount: toStringBaseUnitBN(amountUsdc.times(0.866616), Usdc.decimals),
              usdcAmount: toStringBaseUnitBN(amountUsdc, Usdc.decimals),
              fertAmount: toStringBaseUnitBN(amountUsdc, 0),
              minLP: minLP.toString(),
              minLPSlip: Farm.slip(minLP, 0.1 / 100).toString(),
            });
            call = beanstalk.mintFertilizer(
              /// The input for Fertilizer has 0 decimals;
              /// it's the exact number of FERT you want to mint.
              toStringBaseUnitBN(amountUsdc, 0),
              Farm.slip(minLP, 0.1 / 100),
              FarmFromMode.EXTERNAL,
            );
            break;
          }
          default: {
            call = Promise.reject(new Error('Unrecognized token.'));
            break;
          }
        }
      }

      // Beanstalk pre-Replant but post-BR launch used the below
      // methods directly from the Fertilizer ERC1155 contract.
      else {
        switch (token) {
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

      const txn = await call;
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([
        refetchFertilizer(),
        refetchBalances(),
        refetchAllowances(account.address, fertContract.address, Usdc),
      ]);
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      // this sucks
      txToast ? txToast.error(err) : toast.error(parseError(err));
      console.error(err);
    }
  }, [fertContract, beanstalk, account?.address, Eth, Usdc, isReplanted, refetchFertilizer, refetchBalances, refetchAllowances, farm.contracts.curve.zap.callStatic, farm.contracts.curve.pools.beanCrv3.address]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <BuyForm
          handleQuote={handleQuote}
          contract={contract}
          balances={balances}
          tokenOut={tokenOut}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Buy;

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
