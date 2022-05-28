import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Card, IconButton, Stack, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { FieldArray, Form, Formik, FormikProps } from 'formik';
import TokenSelectDialog from 'components/v2/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/v2/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/v2/Common/Form';
import TokenQuoteProvider from 'components/v2/Common/Form/TokenQuoteProvider';
import useDepositSummary from 'hooks/useDepositSummary';
import TransactionPreview from 'components/v2/Common/Form/TransactionPreview';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues>
  & { to: Token }
> = ({
  // Custom
  to,
  // Formik
  values,
  setFieldValue,
}) => {
  // TODO: extract these?
  const baseTokens = useMemo(() => ([BEAN, ETH]), []);
  const erc20TokenList = useTokenMap(baseTokens);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const { bdv, stalk, seeds, actions } = useDepositSummary(to, values.tokens);

  // console.debug('[DepositForm] render');
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
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
      ...Array.from(copy).map((token) => ({ token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);
  
  return (
    <Form noValidate>
      <Stack gap={1}>
        <FieldArray name="tokens">
          {() => (
            <div>
              <TokenSelectDialog
                open={showTokenSelect}
                handleClose={handleClose}
                selected={values.tokens}
                handleSubmit={handleSelectTokens}
                balances={balances}
                tokenList={erc20TokenList}
              />
              <Stack gap={1.5}>
                {values.tokens.map((state, index) => (
                  <TokenQuoteProvider
                    name={`tokens.${index}`}
                    tokenOut={to}
                    balance={balances[state.token.address] || undefined}
                    state={state}
                    showTokenSelect={handleOpen}
                  />
                ))}
              </Stack>
            </div>
          )}
        </FieldArray>
        {/* <Box sx={{ fontSize: 12 }}>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Box> */}
        {bdv.gt(0) ? (
          <Stack direction="column" gap={1}>
            <TokenOutputField
              token={to}
              value={bdv}
            />
            <Stack direction="row" gap={1} justifyContent="center">
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={STALK}
                  value={stalk}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={SEEDS}
                  value={seeds}
                />
              </Box>
            </Stack>
            <Box>
              <Accordion defaultExpanded variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TransactionPreview
                    actions={actions}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
        ) : null}
        <Button disabled type="submit" size="large" fullWidth>
          Deposit
        </Button>
      </Stack>
    </Form>
  );
};

// -----------------------------------------------------------------------

const Deposit : React.FC<{ to: Token; }> = ({ to }) => {
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
  // poolState: BeanPoolState;
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
            <Deposit to={props.token} />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
