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
  }
};

const ChopForm : React.FC<
  FormikProps<ChopFormValues>
  & {
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: BeanstalkReplanted;
    weather: BigNumber;
    farm: Farm;
  }
> = ({
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
  weather,
  farm,
}) => {
  // TODO: constrain this when siloToken = Unripe
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([UNRIPE_BEAN, UNRIPE_BEAN_CRV3]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();
  const Bean = useChainConstant(BEAN);

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

  const beans = values.tokens[0].token === Bean
    ? values.tokens[0]?.amount || ZERO_BN
    : values.tokens[0]?.amountOut || ZERO_BN;

  const isSubmittable = beans?.gt(0);
  const numPods = beans.multipliedBy(weather.div(100).plus(1));
  const chopPenalty = new BigNumber(999); // TODO: calculate chop penalty

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
          name="tokens.token"
          fullWidth
          InputProps={{
            endAdornment: (
              <TokenAdornment
                token={values.tokens[0] as unknown as ERC20Token}
                onClick={showTokenSelect}
              />
            ),
          }}
          // Other
          // balance={balances[values.tokens[0].token.address] || undefined}
          balance={new BigNumber(1000)} // TODO: pass user's unripe bean balance
        />
        {isSubmittable ? (
          <>
            <TxnSeparator />
            <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>Chop Penalty:</Typography>
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>{displayBN(chopPenalty)}</Typography>
            </Stack>
            <TokenOutputField
              token={BEAN[1]}
              amount={numPods}
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
          disabled={!isSubmittable}
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

const PREFERRED_TOKENS : PreferredToken[] = [
  {
    token: UNRIPE_BEAN,
    minimum: new BigNumber(0.001),    // $1
  },
  {
    token: UNRIPE_BEAN_CRV3,
    minimum: new BigNumber(0.001) // ~$2-4
  },
];

const Chop : React.FC<{}> = () => {
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const balances = useFarmerBalances();
  const Bean = useChainConstant(BEAN);
  const Eth = useChainConstant(ETH);
  const { data: signer } = useSigner();
  const provider = useProvider();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);
  const weather = useSelector<AppState, AppState['_beanstalk']['field']['weather']['yield']>((state) => state._beanstalk.field.weather.yield);

  // Form setup
  const initialValues : ChopFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: null,
      },
    ],
  }), [baseToken]);

  // Handlers
  const onSubmit = useCallback(async (values: ChopFormValues, formActions: FormikHelpers<ChopFormValues>) => {
    try {
      const formData = values.tokens[0];
      const inputToken = formData.token;
      const amountBeans = inputToken === Bean ? formData.amount : formData.amountOut;
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!amountBeans || amountBeans.eq(0)) throw new Error('No amount set');

      // TEMP: recast as BeanstalkReplanted
      const data : string[] = [];
      const amountPods = amountBeans.times(weather.div(100).plus(1));
      let value = ZERO_BN;

      const txToast = new TransactionToast({
        loading: `Sowing ${displayFullBN(amountBeans, Bean.decimals)} Beans for ${displayFullBN(amountPods, PODS.decimals)} Pods`,
        success: 'Sow complete.',
      });

      // Sow directly from BEAN
      if (inputToken === Bean) {
        // Nothing to do
      }

      // Swap to BEAN and Sow
      else {
        // Require a quote
        if (!formData.steps || !formData.amountOut) throw new Error(`No quote available for ${formData.token.symbol}`);

        if (inputToken === Eth) {
          if (!formData.amount) throw new Error('No amount set');
          value = value.plus(formData.amount);
          data.push(beanstalk.interface.encodeFunctionData('wrapEth', [
            toStringBaseUnitBN(value, Eth.decimals),
            FarmToMode.INTERNAL,
          ]));
        }

        // Encode steps to get from token i to siloToken
        const encoded = Farm.encodeStepsWithSlippage(
          formData.steps,
          0.1 / 100,
          // ethers.BigNumber.from(toStringBaseUnitBN(values.settings.slippage / 100, 6)), // slippage
        );
        data.push(...encoded);
        encoded.forEach((_data, index) =>
          console.debug(`[Deposit] step ${index}:`, formData.steps?.[index]?.decode(_data).map((elem) => (elem instanceof ethers.BigNumber ? elem.toString() : elem)))
        );
      }

      data.push(
        beanstalk.interface.encodeFunctionData('sow', [
          toStringBaseUnitBN(amountBeans, Bean.decimals),
          FarmFromMode.INTERNAL_EXTERNAL,
        ])
      );

      //
      return beanstalk.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) })
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
        });
    } catch (e) {
      // txToast.error(err);
      formActions.setSubmitting(false);
    }
  }, [
    beanstalk,
    weather,
    Bean,
    Eth
  ]);

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
            weather={weather}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Chop;
