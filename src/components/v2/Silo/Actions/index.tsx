import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { Token } from 'classes';
import { BEAN, ETH } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { BeanPoolState } from 'state/v2/bean/pools';
import { FieldArray, Form, Formik, FormikProps } from 'formik';
import InputField from 'components/v2/Common/Form/InputField';
import TokenAdornment from 'components/v2/Common/Form/TokenAdornment';
import TokenSelectDialog from 'components/v2/Common/Form/TokenSelectDialog';

type DepositFormValues = {
  tokens: ({
    token: Token;
    amount: number | undefined;
  })[]
}

// Each transaction in the Farm function needs to

const useDepositSummary = (to: Token, tokens: DepositFormValues['tokens']) => {
  console.log();
  return [];
};

const DepositForm : React.FC<
  FormikProps<DepositFormValues>
  & { to: Token }
> = ({
  // Custom
  to,
  // Formik
  values,
  setFieldValue
}) => {
  // TODO: extract these?
  const baseTokens = useMemo(() => ([BEAN, ETH]), []);
  const erc20TokenList = useTokenMap(baseTokens);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const summary = useDepositSummary(to, values.tokens);

  console.debug('[DepositForm] render');
  const onSelect = useCallback((_tokens: Set<Token>) => {
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
      ...Array.from(copy).map((token) => ({ token, amount: 0 })),
    ]);
  }, [values.tokens, setFieldValue]);
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  
  return (
    <Form>
      <Stack gap={1}>
        {/* <div><pre>{JSON.stringify(values, null, 2)}</pre></div> */}
        {/* Deposit Amount */}
        <FieldArray name="tokens">
          {(arrayHelpers) => (
            <div>
              <TokenSelectDialog
                open={showTokenSelect}
                handleClose={handleClose}
                selected={values.tokens}
                onSelect={onSelect}
                balances={balances}
                tokenList={erc20TokenList}
                />
              {values.tokens.map((token, index) => (
                <div key={token.token.address}>
                  <InputField
                    name={`tokens.${index}.amount`}
                    InputProps={{
                        endAdornment: (
                          <TokenAdornment
                            token={token.token}
                            onClick={() => setShowTokenSelect(true)}
                          />
                        )
                      }}
                    />
                  <button onClick={() => setFieldValue(`tokens.${index}.amount`, 69420)}>Max</button>
                </div>
                ))}
            </div>
            )}
        </FieldArray>
        <Button onClick={() => { setFieldValue('tokens.0.amount', 99); }} size="large" fullWidth>
          Test
        </Button>
        <Button disabled type="submit" size="large" fullWidth>
          Deposit
        </Button>
      </Stack>
    </Form>
  );
};

const Deposit : React.FC<{
  to: Token;
  // poolState: BeanPoolState;
}> = ({
  to,
  // poolState,
}) => {
  const Bean = useChainConstant(BEAN);
  const initialValues : DepositFormValues = useMemo(() => ({
    tokens: [
      {
        token: Bean,
        amount: undefined,
      },
    ],
  }), [Bean]);

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(props) => <DepositForm to={to} {...props} />}
    </Formik>
  );
};

// -----------------------------------------------------------------------

const Actions : React.FC<{
  token: Token;
  poolState: BeanPoolState;
}> = (props) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Deposit" />
            <Tab label="Withdraw" />
          </Tabs>
          <Box>
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Stack>
        {/* Tabs */}
        <Box>
          {tab === 0 ? (
            <Deposit
              to={props.token}
              poolState={props.poolState}
            />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
