import { Stack } from '@mui/material';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import { FormState, SmartSubmitButton, TokenQuoteProvider, TokenSelectDialog } from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { BeanstalkReplanted } from 'constants/generated';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, WETH } from 'constants/tokens';
import { Form, Formik, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useGetChainToken from 'hooks/useGetChainToken';
import useTokenMap from 'hooks/useTokenMap';
import Farm from 'lib/Beanstalk/Farm';
import React, { useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';

type SowFormValues = FormState;

const SowForm : React.FC<
  FormikProps<SowFormValues>
  & {
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: BeanstalkReplanted;
  }
> = ({
  values,
  setFieldValue,
  balances,
  beanstalk,
}) => {
  const chainId = useChainId();
  // TODO: constrain this when siloToken = Unripe
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([BEAN, ETH, WETH]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();
  const getChainToken = useGetChainToken();
  const Bean = getChainToken(BEAN);

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

  return (
    <Form>
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
        <TokenQuoteProvider
          key={`tokens.0`}
          name={`tokens.0`}
          tokenOut={Bean}
          balance={balances[values.tokens[0].token.address] || undefined}
          state={values.tokens[0]}
          showTokenSelect={showTokenSelect}
          handleQuote={() => Promise.resolve(ZERO_BN)}
        />
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          contract={beanstalk}
          tokens={values.tokens}
          mode="auto"
        >
          Sow
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

const Sow : React.FC<{}> = () => {
  const balances = useFarmerBalances();
  const Bean = useChainConstant(BEAN);
  const Eth = useChainConstant(ETH);
  const { data: signer } = useSigner();
  const provider = useProvider();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);
  return (
    <Formik<SowFormValues>
      initialValues={{
        tokens: [
          {
            token: Bean,
            amount: null,
          }
        ]
      }}
      onSubmit={() => {}}
    >
      {(formikProps: FormikProps<SowFormValues>) => (
        <SowForm
          balances={balances}
          beanstalk={beanstalk}
          {...formikProps}
        />
      )}
    </Formik>
  );
}


export default Sow;
