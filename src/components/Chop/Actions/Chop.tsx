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
import { BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from 'constants/index';
import { BEAN, BEAN_CRV3_LP, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, displayFullBN, getChainConstant, parseError, toStringBaseUnitBN } from 'util/index';
import { useSigner } from 'hooks/ledger/useSigner';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import TokenInputField from '../../Common/Form/TokenInputField';
import { BeanstalkPalette } from '../../App/muiTheme';
import useChainId from '../../../hooks/useChain';
import TransactionToast from '../../Common/TxnToast';
import { FarmToMode } from '../../../lib/Beanstalk/Farm';
import DestinationField from '../../Field/DestinationField';

type ChopFormValues = FormState & {
  settings: {
    slippage: number;
  },
  amount: BigNumber;
  destination: FarmToMode;
};

const ChopForm: React.FC<FormikProps<ChopFormValues>
  & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: BeanstalkReplanted;
  // chopPenalty: BigNumber;
}> = ({
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
  // chopPenalty
}) => {
  // TODO: constrain this when siloToken = Unripe
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([UNRIPE_BEAN, UNRIPE_BEAN_CRV3]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  // Maps an unripe token to its output token
  const tokenOutputMap = {
    [getChainConstant(UNRIPE_BEAN, chainId).address]: getChainConstant(BEAN, chainId),
    [getChainConstant(UNRIPE_BEAN_CRV3, chainId).address]: getChainConstant(BEAN_CRV3_LP, chainId),
  };

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

  const penalties = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);
  const selectedTokenAddress = values.tokens[0].token.address;
  const chopPenalty = penalties.penalties[selectedTokenAddress];
  const displayPenalty = new BigNumber(1).minus(chopPenalty).multipliedBy(100);
  const tokenBalance = values.amount;
  const amountOut = tokenBalance?.multipliedBy(chopPenalty);
  const outputToken = tokenOutputMap[values.tokens[0].token.address];

  // useEffect(() => {
  //   setFieldValue('amount', balances[selectedTokenAddress]?.total);
  // }, [balances, selectedTokenAddress, setFieldValue]);

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
        {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
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
        <DestinationField
          name="destination"
        />
        {tokenBalance?.gt(0) ? (
          <>
            <TxnSeparator />
            <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>Chop Penalty:</Typography>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>{displayBN(displayPenalty)}%</Typography>
            </Stack>
            <TokenOutputField
              token={outputToken}
              amount={amountOut}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: `Chop ${displayBN(values.amount)} Unripe ${values.tokens[0].token.symbol}`
                      },
                      {
                        type: ActionType.BASE,
                        message: `Receive ${displayBN(amountOut)} ${outputToken}`
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

const Chop: React.FC<{}> = () => {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farmerBalances   = useFarmerBalances();
  const chainId = useChainId();
  const urBean = getChainConstant(UNRIPE_BEAN, chainId);

  // Form setup
  const initialValues: ChopFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    tokens: [
      {
        token: urBean,
        amount: null,
      },
    ],
    destination: FarmToMode.INTERNAL,
    amount: farmerBalances[urBean.address]?.total, // VERIFY: internal, external, or total?
  }), [farmerBalances, urBean]);

  const onSubmit = useCallback(async (values: ChopFormValues, formActions: FormikHelpers<ChopFormValues>) => {
    let txToast;
    try {
      if (!farmerBalances[urBean.address]?.total.gt(0)) throw new Error('No Unfertilized token to Chop.');
      if (!account?.address) throw new Error('Connect a wallet first.');

      const token = values.tokens[0].token

      txToast = new TransactionToast({
        loading: `Chopping ${displayFullBN(values.amount)} ${token.symbol}`,
        success: 'Chop successful.',
      });

      const txn = await beanstalk.ripen(
        token.address,
        toStringBaseUnitBN(values.amount, token.decimals),
        values.destination
      );

      txToast.confirming(txn);

      const receipt = await txn.wait();
      txToast.success(receipt);
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
    }
  }, [account?.address, beanstalk, farmerBalances, urBean.address]);

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
            balances={farmerBalances}
            beanstalk={beanstalk}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Chop;
