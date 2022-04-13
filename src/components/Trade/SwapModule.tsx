import React from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { BEAN, ETH, LP_FEE, SLIPPAGE_THRESHOLD } from 'constants/index';
import {
  displayBN,
  getFromAmount,
  getToAmount,
  MinBN,
  MinBNs,
  TokenLabel,
  TrimBN,
} from 'util/index';
import {
  FrontrunText,
  SettingsFormModule,
  SwapTransactionDetailsModule,
  TokenInputField,
} from 'components/Common';

export default function SwapModule(props) {
  /* Handlers: "from" field */
  const fromValueUpdated = (newFromNumber: BigNumber) => {
    if (newFromNumber.isLessThan(0)) {
      props.setFromValue(new BigNumber(-1));
      props.setToValue(new BigNumber(-1));
    }
    const fromReserve = props.orderIndex ? props.ethReserve : props.beanReserve;
    const fromNumber = MinBNs([newFromNumber, props.balance, fromReserve]);
    const toReserve = !props.orderIndex ? props.ethReserve : props.beanReserve;
    const newToValue = getToAmount(fromNumber, fromReserve, toReserve);

    props.setFromValue(
      TrimBN(fromNumber, props.orderIndex ? ETH.decimals : BEAN.decimals)
    );
    props.setToValue(
      TrimBN(newToValue, props.orderIndex ? BEAN.decimals : ETH.decimals)
    );
  };
  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };

  /* Handlers: "to" field */
  const getExpectedBeanPrice = (fromValue: BigNumber, toValue: BigNumber) => {
    const [estbeanReserve, estethReserve] = props.orderIndex
      ? [props.beanReserve.minus(toValue), props.ethReserve.plus(fromValue)]
      : [props.beanReserve.plus(fromValue), props.ethReserve.minus(toValue)];
    const endPrice = estethReserve
      .dividedBy(estbeanReserve)
      .dividedBy(props.usdcPrice);
    return props.beanPrice.plus(endPrice).dividedBy(2);
  };
  const toValueUpdated = (newToNumber: BigNumber) => {
    const fromReserve = props.orderIndex ? props.ethReserve : props.beanReserve;
    const toReserve = props.orderIndex ? props.beanReserve : props.ethReserve;
    const toNumber = MinBN(newToNumber, toReserve);
    const proposedNewFromValue = getFromAmount(
      toNumber,
      fromReserve,
      toReserve,
      props.orderIndex ? ETH.decimals : BEAN.decimals
    );
    if (proposedNewFromValue.isGreaterThan(props.maxFromVal)) {
      fromValueUpdated(props.maxFromVal);
    } else {
      props.setFromValue(
        TrimBN(
          proposedNewFromValue,
          props.orderIndex ? ETH.decimals : BEAN.decimals
        )
      );
      props.setToValue(
        TrimBN(toNumber, props.orderIndex ? BEAN.decimals : ETH.decimals)
      );
    }
  };
  const handleToChange = (event) => {
    if (event.target.value) {
      toValueUpdated(new BigNumber(event.target.value));
    } else {
      toValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    fromValueUpdated(props.maxFromVal);
  };

  /* Input Fields */
  const fromField = (
    <TokenInputField
      value={TrimBN(props.fromValue, props.orderIndex ? 9 : BEAN.decimals)}
      setValue={fromValueUpdated}
      handleChange={handleFromChange}
      token={props.fromToken}
      balance={props.balance}
      maxHandler={maxHandler}
    />
  );
  const toField = (
    <TokenInputField
      value={TrimBN(props.toValue, props.orderIndex ? BEAN.decimals : 9)}
      setValue={toValueUpdated}
      handleChange={handleToChange}
      token={props.toToken}
      balance={props.toBalance}
    />
  );

  /* Switch Fields */
  const switchField = (
    <IconButton
      onClick={() => {
        props.setFromValue(new BigNumber(-1));
        props.setToValue(new BigNumber(-1));
        props.setOrderIndex(!props.orderIndex);
      }}
      style={{ marginTop: '-6px', marginBottom: '-24px' }}
      color="primary"
      size="large">
      <UnfoldMoreIcon />
    </IconButton>
  );

  /* Transaction Details, settings and text */
  const frontrunTextField = props.settings.slippage.isLessThanOrEqualTo(
    SLIPPAGE_THRESHOLD
  ) ? (
    <FrontrunText />
  ) : null;
  const showSettings = (
    <SettingsFormModule
      settings={props.settings}
      setSettings={props.setSettings}
      showUnitModule={false}
      hasSlippage
    />
  );
  const expectedBeanPrice = getExpectedBeanPrice(
    props.fromValue,
    props.toValue
  );
  const fee = props.orderIndex
    ? props.fromValue.dividedBy(props.usdcPrice).multipliedBy(LP_FEE)
    : props.fromValue.multipliedBy(props.beanPrice).multipliedBy(LP_FEE);

  const textTransaction = props.orderIndex
    ? `Buy ${displayBN(
        props.toValue.multipliedBy(props.settings.slippage)
      )} ${TokenLabel(props.toToken)} with ${props.fromValue.toFixed(
        4
      )} ${TokenLabel(props.fromToken)} for ${expectedBeanPrice.toFixed(
        4
      )} each`
    : `Buy ${props.toValue.toFixed(4)} ${TokenLabel(
        props.toToken
      )} with ${displayBN(props.fromValue)} ${TokenLabel(
        props.fromToken
      )} for ${expectedBeanPrice.toFixed(4)} each`;

  /* Display transaction details */
  function TransactionDetails() {
    if (props.toValue.isLessThanOrEqualTo(0)) return null;
    return (
      <>
        <Box style={{
          fontFamily: 'Futura-PT-Book',
          fontSize: 'calc(9px + 0.5vmin)',
        }}>
          {textTransaction}
        </Box>
        <SwapTransactionDetailsModule
          fields={{
            'Minimum Received': `${props.toValue
              .multipliedBy(props.settings.slippage)
              .toFixed(4)} ${TokenLabel(props.toToken)}`,
            'Expected Price': `$ ${expectedBeanPrice.toFixed(4)}`,
            'LP Fee': `0.3% ($${fee.toFixed(2)})`,
          }}
        />
      </>
    );
  }

  return (
    <>
      {fromField}
      {switchField}
      {toField}
      {frontrunTextField}
      <TransactionDetails />
      {showSettings}
    </>
  );
}
