import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Stack, Tooltip, Typography } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider, useSigner } from 'wagmi';
import { Token } from 'classes';
import { BEAN } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { useBeanstalkContract } from 'hooks/useContract';
import { FarmerSiloBalance } from 'state/farmer/silo';
import { ActionType } from 'util/Actions';
import usePools from 'hooks/usePools';
import { ERC20Token } from 'classes/Token';
import useSeason from 'hooks/useSeason';
import { FormTokenState, TxnPreview, TokenOutputField, TokenSelectDialog, TxnSeparator, TokenQuoteProvider, TxnSettings, SettingInput } from 'components/Common/Form';
import { BeanstalkReplanted } from 'generated/index';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';
import { ZERO_BN } from 'constants/index';
import { displayFullBN, displayTokenAmount, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import DestinationField from 'components/Common/Form/DestinationField';
import TokenIcon from 'components/Common/TokenIcon';
import useToggle from 'hooks/display/useToggle';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import PillRow from 'components/Common/Form/PillRow';
import { QuoteHandler } from 'hooks/useQuote';
import { ethers } from 'ethers';
import { LoadingButton } from '@mui/lab';
import TransactionToast from 'components/Common/TxnToast';

// -----------------------------------------------------------------------

type ClaimFormValues = {
  /**
   * When claiming, there is only one input token
   * (the claimable LP token). the amount of this
   * token is always the full claimable balance.
   * 
   * In this case, token.amountOut is the amount received
   * for converting LP into `tokenOut`.
   */
  token: FormTokenState;
  destination: FarmToMode;
  tokenOut: ERC20Token;
} & {
  settings: {
    slippage: number;
  }
};

// -----------------------------------------------------------------------

const ClaimForm : React.FC<
  FormikProps<ClaimFormValues> & {
    token: Token;
    claimableBalance: BigNumber;
    farm: Farm;
  }
> = ({
  // Custom
  token,
  claimableBalance,
  farm,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const pools = usePools();
  const isMainnet = chainId === SupportedChainId.MAINNET;
  const getChainToken = useGetChainToken();
  
  // ASSUMPTION: Pool address === LP Token address
  // Lazy way to do this. Should key pools by lpToken.address.
  const pool = pools[token.address];
  const claimableTokens = useMemo(() => ([
    token,
    ...(token.isLP && pool?.tokens || []),
  ]), [pool, token]);

  //
  const amount = claimableBalance;
  const isSubmittable = (
    amount
    && amount.gt(0)
    && values.destination !== undefined
  );
  const destination = (
    values.destination === FarmToMode.EXTERNAL
      ? 'to your wallet'
      : 'to your internal balance'
  );
  
  //
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      if (_tokenIn === _tokenOut) return { amountOut: _amountIn };
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, _tokenIn.decimals));
      
      // Require pooldata to be loaded first
      if (token.isLP && !pool) return null; 

      // const tokenIndex = pool.tokens.findIndex((tok) => tok === _tokenOut);
      // if (tokenIndex === -1) throw new Error('No token found');
      // const indices = [0, 0];
      // indices[tokenIndex] = 1; // becomes [0, 1] or [1, 0]

      const estimate = await Farm.estimate([
        // pool.address,
        // farm.contracts.curve.registries.metaFactory.address,
        // indices as [number, number],
        // // Always comes from internal balance
        // FarmFromMode.INTERNAL,
        // // FIXME: changes to values.destination trigger
        // // re-calculations here when they shouldn't
        // values.destination
        farm.removeLiquidityOneToken(
          pool.address,
          farm.contracts.curve.registries.metaFactory.address,
          _tokenOut.address,
          // Always comes from internal balance
          FarmFromMode.INTERNAL,
          values.destination,
        ),
      ], [amountIn]);
      return {
        amountOut: toTokenUnitsBN(estimate.amountOut.toString(), _tokenOut.decimals),
        steps: estimate.steps,
      };
    },
    [
      farm,
      token.isLP,
      pool,
      values.destination
    ]
  );

  //
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  //
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    const _token = Array.from(_tokens)[0];
    setFieldValue('tokenOut', _token);
  }, [setFieldValue]);

  // This should be memoized to prevent an infinite reset loop
  const quoteSettings = useMemo(() => ({
    ignoreSameToken: false,
    onReset: () => ({ amountOut: claimableBalance }),
  }), [claimableBalance]);

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          {/* Form Content */}
          <Stack gap={1}>
            {/* Claimable Token */}
            <TokenQuoteProvider
              name="token"
              tokenOut={values.tokenOut}
              state={values.token}
              // This input is always disabled but we use
              // the underlying handleQuote functionality
              // for consistency with other forms.
              disabled 
              // 
              balance={amount || ZERO_BN}
              balanceLabel="Claimable Balance"
              // -----
              // FIXME:
              // "disableTokenSelect" applies the disabled prop to
              // the TokenSelect button. However if we don't pass
              // a handler to the button then it's effectively disabled
              // but shows with stronger-colored text. param names are
              // a bit confusing.
              // disableTokenSelect={true}
              quoteSettings={quoteSettings}
              handleQuote={handleQuote}
              hideQuote
            />
            {/* Setting: Destination */}
            <DestinationField
              name="destination"
            />
            {/* Setting: Claim LP */}
            {token.isLP ? (
              <PillRow
                isOpen={isTokenSelectVisible}
                label="Claim LP as"
                onClick={showTokenSelect}> 
                <TokenIcon token={values.tokenOut} />
                <Typography variant="body1">{values.tokenOut.name}</Typography>
              </PillRow>
            ) : null}
            <TokenSelectDialog
              open={isTokenSelectVisible}
              handleClose={hideTokenSelect}
              handleSubmit={handleSelectTokens}
              selected={[values.tokenOut]}
              balances={undefined} // hide balances from right side of selector
              tokenList={claimableTokens}
              mode={TokenSelectMode.SINGLE}
            />
          </Stack>
          {/* Transaction Details */}
          {isSubmittable ? (
            <>
              <TxnSeparator mt={-1} />
              <TokenOutputField
                token={values.tokenOut}
                amount={values.token.amountOut || ZERO_BN}
                isLoading={values.token.quoting}
              />
              <Box>
                <Accordion variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TxnPreview
                      actions={[
                        {
                          type: ActionType.BASE,
                          message: `Claim ${displayTokenAmount(amount, token)}.`
                        },
                        {
                          type: ActionType.BASE,
                          message: values.tokenOut === token ? (
                            `Unpack ${displayTokenAmount(amount, token)} into 3CRV and send ${destination}.`
                          ) : (
                            `Send ${displayTokenAmount(amount, token)} and send ${destination}.`
                          )
                        }
                      ]}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </>
          ) : null}
          <LoadingButton
            variant="contained"
            loading={isSubmitting}
            disabled={!isSubmittable || isSubmitting || isMainnet}
            type="submit"
            size="large"
            fullWidth
          >
            Claim
          </LoadingButton>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

const Claim : React.FC<{
  token: ERC20Token;
  siloBalance: FarmerSiloBalance;
}> = ({
  token,
  siloBalance
}) => {
  // Constants
  const Bean = useChainConstant(BEAN);

  // Contracts
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const currentSeason = useSeason();
  const provider = useProvider();
  const farm = useMemo(() => new Farm(provider), [provider]);

  // Balances
  const claimableBalance = siloBalance?.claimable.amount;

  // Form
  const initialValues : ClaimFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1,
    },
    destination: FarmToMode.INTERNAL,
    tokenOut: token,
    token: {
      token: token,
      amount: claimableBalance,
      amountOut: claimableBalance
    }
  }), [token, claimableBalance]);
  const onSubmit = useCallback((values: ClaimFormValues, formActions: FormikHelpers<ClaimFormValues>) => {
    let call;
    const crates = siloBalance?.claimable?.crates;
    if (!crates || crates.length === 0) throw new Error('No claimable crates');

    const txToast = new TransactionToast({
      loading: `Claiming ${displayFullBN(claimableBalance)} ${token.name} from the Silo`,
      success: 'Claiming successful',
    });
    
    // If the user wants to swap their LP token for something else,
    // we send their Claimable `token` to their internal balance for
    // ease of interaction and gas efficiency.
    const removeLiquidity  = (values.tokenOut !== token);
    const claimDestination = token.isLP && removeLiquidity
      ? FarmToMode.INTERNAL
      : values.destination;

    console.debug(`[Claim] claimDestination = ${claimDestination}, crates = `, crates);

    const data : string[] = [];
    
    // Claim multiple withdrawals of `token` in one call
    if (crates.length > 1) {
      console.debug(`[Claim] claiming ${crates.length} withdrawals`);
      data.push(
        beanstalk.interface.encodeFunctionData('claimWithdrawals', [
          token.address,
          crates.map((crate) => crate.season.toString()),
          claimDestination,
        ])
      );
    } 
    
    // Claim a single withdrawal of `token` in one call. Gas efficient.
    else {
      console.debug('[Claim] claiming a single withdrawal');
      data.push(
        beanstalk.interface.encodeFunctionData('claimWithdrawal', [
          token.address,
          crates[0].season.toString(),
          claimDestination,
        ])
      );
    }

    //
    if (token.isLP && removeLiquidity) {
      if (!values.token.steps) throw new Error('No quote found.');
      const encoded = Farm.encodeStepsWithSlippage(
        values.token.steps,
        values.settings.slippage/100,
        // ethers.BigNumber.from(toStringBaseUnitBN(values.settings.slippage / 100, 6))
      );
      values?.token?.steps.forEach((step, i) => console.debug(`step ${i}:`, step.decode(encoded[i])));
      data.push(...encoded);
    }

    beanstalk.farm(data, {})
      .then((txn) => {
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        txToast.success(receipt);
        formActions.resetForm();
      })
      .catch((err) => {
        console.error(
          txToast.error(err.error || err)
        );
        formActions.setSubmitting(false);
      });
  }, [
    beanstalk,
    siloBalance?.claimable,
    claimableBalance,
    token,
    // Bean,
    // beanstalk,
    // token
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <Stack spacing={1}>
            <ClaimForm
              token={token}
              claimableBalance={claimableBalance}
              farm={farm}
              {...formikProps}
            />
          </Stack>
        </>
      )}
    </Formik>
  );
};

export default Claim;
