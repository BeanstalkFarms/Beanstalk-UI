import React from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@material-ui/core';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import { BEAN, ETH, LP_FEE, SLIPPAGE_THRESHOLD } from '../../constants';
import {
  displayBN,
  getFromAmount,
  getToAmount,
  MinBN,
  MinBNs,
  TokenLabel,
  TrimBN,
} from '../../util';
import {
  FrontrunText,
  SettingsFormModule,
  TokenInputField,
  TransactionDetailsModule,
} from '../Common';

export default function SwapSubModule(props) {
  const fromValueUpdated = (newFromNumber) => {
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

  const getExpectedBeanPrice = (fromValue, toValue) => {
    const [estbeanReserve, estethReserve] = props.orderIndex
      ? [props.beanReserve.minus(toValue), props.ethReserve.plus(fromValue)]
      : [props.beanReserve.plus(fromValue), props.ethReserve.minus(toValue)];
    const endPrice = estethReserve
      .dividedBy(estbeanReserve)
      .dividedBy(props.usdcPrice);
    return props.beanPrice.plus(endPrice).dividedBy(2);
  };

  const toValueUpdated = (newToNumber) => {
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
    >
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
    ? `You will buy ~${displayBN(
        props.toValue.multipliedBy(props.settings.slippage)
      )} ${TokenLabel(props.toToken)} with ${props.fromValue.toFixed(
        3
      )} ${TokenLabel(props.fromToken)} for ${expectedBeanPrice.toFixed(
        2
      )} each.`
    : `You will sell ~${displayBN(props.fromValue)} ${TokenLabel(
        props.fromToken
      )} for about ${props.toValue.toFixed(3)} ${TokenLabel(
        props.toToken
      )} for ${expectedBeanPrice.toFixed(2)} each.`;

  function transactionDetails() {
    if (props.toValue.isGreaterThan(0)) {
      return (
        <>
          <Box style={{ fontFamily: 'Futura-PT-Book' }}>{textTransaction}</Box>
          <TransactionDetailsModule
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
    return null;
  }

  return (
    <>
      {fromField}
      {switchField}
      {toField}
      {frontrunTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
}
