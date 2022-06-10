import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Card, IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { FieldArray, Form, Formik, FormikProps } from 'formik';
import TokenSelectDialog from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import useDepositSummary from 'hooks/summary/useDepositSummary';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const TOKEN_LIST = [BEAN, ETH];

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
  const erc20TokenMap = useTokenMap(TOKEN_LIST);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const { bdv, stalk, seeds, actions } = useDepositSummary(to, values.tokens);
  const chainId = useChainId();

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

  const isMainnet = chainId === SupportedChainId.MAINNET;
  
  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          {/* @ts-ignore */}
          <FieldArray name="tokens">
            {() => (
              <div>
                <TokenSelectDialog
                  open={showTokenSelect}
                  handleClose={handleClose}
                  selected={values.tokens}
                  handleSubmit={handleSelectTokens}
                  balances={balances}
                  tokenList={erc20TokenMap}
                />
                <Stack gap={1.5}>
                  {values.tokens.map((state, index) => (
                    <TokenQuoteProvider
                      name={`tokens.${index}`}
                      tokenOut={to}
                      balance={balances[state.token.address] || undefined}
                      state={state}
                      showTokenSelect={handleOpen}
                      disabled={isMainnet}
                      disableTokenSelect={isMainnet}
                    />
                  ))}
                </Stack>
              </div>
            )}
          </FieldArray>
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
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

// TODO:
// - implement usePreferredToken here
const Deposit : React.FC<{ to: Token; }> = ({ to }) => {
  const Bean = useChainConstant(BEAN);
  const initialValues : DepositFormValues = useMemo(() => ({
    tokens: [
      {
        token: Bean,
        amount: null,
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

const Actions : React.FC<{ token: Token; }> = (props) => {
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
            <Box sx={{ position: 'relative' }}>
              <Deposit to={props.token} />
            </Box>
          ) : null}
          {tab === 1 ? (
            <Stack sx={{ p: 4 }} direction="row" justifyContent="center" alignItems="center">
              <Typography color="text.secondary">
                Withdrawals will be available once Beanstalk is Replanted.
              </Typography>
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
