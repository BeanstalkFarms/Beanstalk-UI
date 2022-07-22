import { Accordion, AccordionDetails, Box, Button, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput, TokenOutputField,
  TokenQuoteProvider,
  TokenSelectDialog, TxnPreview, TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { SupportedChainId } from 'constants/index';
import { BEAN, ETH, PODS } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import useCurve from '../../../hooks/useCurve';
import { PodListing } from '../Plots.mock';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type FillListingFormValues = FormState

const FillListingForm : React.FC<
  FormikProps<FillListingFormValues>
  & {
    token: ERC20Token | NativeToken;
    podListing: PodListing;
  }
> = ({
  values,
  setFieldValue,
  podListing,
  //
  token: depositToken, // BEAN
}) => {
  const chainId = useChainId();
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  const isMainnet = chainId === SupportedChainId.MAINNET;
  const curve = useCurve();
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen = useCallback(() => setShowTokenSelect(true), []);
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
      ...Array.from(copy).map((_token) => ({ token: _token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const handleQuote = useCallback<QuoteHandler>((tokenIn, amountIn, tokenOut): Promise<BigNumber> => {
    console.debug('[handleQuote] curve: ', curve);
    if (curve) {
      return curve.router.getBestRouteAndOutput(
        tokenIn.address,
        tokenOut.address,
        toStringBaseUnitBN(amountIn, tokenIn.decimals),
      ).then((result) => toTokenUnitsBN(result.output, tokenOut.decimals));
    }
    return Promise.reject();
  }, [curve]);

  const balances = useFarmerBalances();
  const erc20TokenMap = useTokenMap([BEAN, ETH, depositToken]);

  return (
    <Form noValidate>
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={Object.values(erc20TokenMap)}
        />
        <FieldWrapper label="Buy Pods">
          <>
            {values.tokens.map((state, index) => (
              <TokenQuoteProvider
                key={`tokens.${index}`}
                name={`tokens.${index}`}
                tokenOut={depositToken}
                balance={balances[state.token.address] || undefined}
                state={state}
                showTokenSelect={handleOpen}
                disabled={isMainnet}
                disableTokenSelect={isMainnet}
                handleQuote={handleQuote}
              />
            ))}
          </>
        </FieldWrapper>
        <TxnSeparator mt={0} />
        <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
          <Typography variant="body1">Place in Pod Line:</Typography>
          <Typography variant="body1">{displayBN(podListing.index.minus(beanstalkField.harvestableIndex))}</Typography>
        </Stack>
        <TokenOutputField
          token={PODS}
          amount={podListing.remainingAmount}
          isLoading={false}
          />
        <Box>
          <Accordion variant="outlined">
            <StyledAccordionSummary title="Transaction Details" />
            <AccordionDetails>
              <TxnPreview
                actions={[
                    {
                      type: ActionType.BASE,
                      message: 'DO SOMETHING'
                    },
                    {
                      type: ActionType.BASE,
                      message: 'DO SOMETHING!'
                    }
                  ]}
                />
            </AccordionDetails>
          </Accordion>
        </Box>
        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Buy Pods
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const FillListing : React.FC<{podListing: PodListing}> = ({ podListing }) => {
  const Eth = useChainConstant(ETH);

  const initialValues: FillListingFormValues = useMemo(() => ({
    tokens: [
      {
        token: Eth,
        amount: undefined,
      },
    ],
  }), [Eth]);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: FillListingFormValues, formActions: FormikHelpers<FillListingFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<FillListingFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<FillListingFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <FillListingForm
            token={BEAN[1]}
            podListing={podListing}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default FillListing;