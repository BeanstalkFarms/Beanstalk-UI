import { Accordion, AccordionDetails, Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput,
  SmartSubmitButton,
  TokenAdornment,
  TokenOutputField,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TransactionToast from 'components/Common/TxnToast';
import { BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import { ethers } from 'ethers';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import useTokenMap from 'hooks/useTokenMap';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, displayFullBN, toStringBaseUnitBN } from 'util/index';
import { useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import TokenInputField from '../../Common/Form/TokenInputField';
import { BeanstalkPalette } from '../../App/muiTheme';

type ChopFormValues = FormState & {
  settings: {
    slippage: number;
  },
  amount: BigNumber;
};

const ChopForm: React.FC<FormikProps<ChopFormValues>
  & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: BeanstalkReplanted;
}> = ({
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
}) => {
  // TODO: constrain this when siloToken = Unripe
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([UNRIPE_BEAN, UNRIPE_BEAN_CRV3]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  //
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const newValue = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...newValue,
      ...Array.from(copy).map((_token) => ({ token: _token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);

  const chopPenalty = new BigNumber(999); // TODO: calculate chop penalty
  const tokenBalance = values.amount;

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        open={isTokenSelectVisible}
        handleClose={hideTokenSelect}
        handleSubmit={handleSelectTokens}
        selected={values.tokens}
        balances={balances}
        tokenList={Object.values(erc20TokenMap)}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        <pre>{JSON.stringify(values, null, 2)}</pre>
        <TokenInputField
          token={values.tokens[0].token}
          balance={tokenBalance || ZERO_BN}
          name="amount"
          disabled
          // MUI 
          fullWidth
          InputProps={{
            endAdornment: (
              <TokenAdornment
                token={values.tokens[0].token}
                onClick={showTokenSelect}
              />
            )
          }}
        />
        {tokenBalance?.gt(0) ? (
          <>
            <TxnSeparator />
            <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>Chop Penalty:</Typography>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>{displayBN(chopPenalty)}</Typography>
            </Stack>
            <TokenOutputField
              token={BEAN[1]}
              amount={new BigNumber(1)}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'Do this.'
                      },
                      {
                        type: ActionType.BASE,
                        message: 'Then do this.'
                      },
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!tokenBalance?.gt(0)}
          contract={beanstalk}
          tokens={values.tokens}
          mode="auto"
        >
          Chop
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const PREFERRED_TOKENS: PreferredToken[] = [
  {
    token: UNRIPE_BEAN,
    minimum: new BigNumber(0.001),    // $1
  },
  {
    token: UNRIPE_BEAN_CRV3,
    minimum: new BigNumber(0.001) // ~$2-4
  },
];

const Chop: React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const balances = useFarmerBalances();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  // Form setup
  const initialValues: ChopFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: null,
      },
    ],
    amount: new BigNumber(100),
  }), [baseToken]);

  // Handlers
  const onSubmit = useCallback(async (values: ChopFormValues, formActions: FormikHelpers<ChopFormValues>) => {
    console.log('TEST');
  }, []);

  return (
    <Formik<ChopFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<ChopFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <ChopForm
            balances={balances}
            beanstalk={beanstalk}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Chop;
