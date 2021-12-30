import React from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@material-ui/core';
import { ReactComponent as UpDownIcon } from 'img/updown-icon.svg';
import { LP_FEE, SLIPPAGE_THRESHOLD, theme } from 'constants/index';
import {
  displayBN,
  getFromAmount,
  getToAmount,
  MinBN,
  MinBNs,
  TrimBN,
} from 'util/index';
import {
  FrontrunText,
  SettingsFormModule,
  SwapTransactionDetailsModule,
  TradeTokenInputField,
} from 'components/Common';

export default function SwapModule({
  tokenList,
  inputToken,
  outputToken,
  setToToken,
  setFromToken,
  orderIndex,
  setOrderIndex,
  beanReserve,
  ethReserve,
  maxFromVal,
  usdcPrice,
  beanPrice,
  settings,
  setSettings,
  fromValue,
  setFromValue,
  toValue,
  setToValue,
}) {
  const fromValueUpdated = (newFromNumber) => {
    if (newFromNumber.isLessThan(0)) {
      setFromValue(new BigNumber(-1));
      setToValue(new BigNumber(-1));
    }
    const fromNumber = MinBNs([newFromNumber, inputToken.balance, inputToken.reserve]);
    const newToValue = getToAmount(fromNumber, inputToken.reserve, outputToken.reserve);

    setFromValue(TrimBN(fromNumber, inputToken.decimals));
    setToValue(TrimBN(newToValue, outputToken.decimals));
  };

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const handleFromTokenChange = (event) => {
    if (event !== outputToken.token) {
      setFromToken(event);
    } else {
      setToToken(inputToken.token);
      setFromToken(outputToken.token);
    }
  };

  const getExpectedBeanPrice = (fromVal, toVal) => {
    const [estbeanReserve, estethReserve] = orderIndex
      ? [beanReserve.minus(toVal), ethReserve.plus(fromVal)]
      : [beanReserve.plus(fromVal), ethReserve.minus(toVal)];
    const endPrice = estethReserve
      .dividedBy(estbeanReserve)
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };

  const toValueUpdated = (newToNumber) => {
    const toNumber = MinBN(newToNumber, outputToken.reserve);
    const proposedNewFromValue = getFromAmount(
      toNumber,
      inputToken.reserve,
      outputToken.reserve,
      inputToken.decimals
    );
    if (proposedNewFromValue.isGreaterThan(maxFromVal)) {
      fromValueUpdated(maxFromVal);
    } else {
      setFromValue(
        TrimBN(
          proposedNewFromValue,
          inputToken.decimals
        )
      );
      setToValue(
        TrimBN(toNumber, outputToken.decimals)
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
  const handleToTokenChange = (event) => {
    if (event !== inputToken.token) {
      setToToken(event);
      setFromValue(new BigNumber(-1));
      setToValue(new BigNumber(-1));
    } else {
      setFromToken(outputToken.token);
      setToToken(inputToken.token);
    }
  };

  /* Input Fields */

  const fromField = (
    <TradeTokenInputField
      value={TrimBN(fromValue, inputToken.decimals > 9 ? 9 : inputToken.decimals)}
      setValue={fromValueUpdated}
      handleChange={handleFromChange}
      tokenHandler={handleFromTokenChange}
      token={inputToken.token}
      balance={inputToken.balance}
      maxHandler={() => {
        fromValueUpdated(maxFromVal);
      }}
      tokenList={tokenList}
    />
  );
  const toField = (
    <TradeTokenInputField
      value={TrimBN(toValue, outputToken.decimals > 9 ? 9 : outputToken.decimals)}
      setValue={toValueUpdated}
      handleChange={handleToChange}
      tokenHandler={handleToTokenChange}
      token={outputToken.token}
      balance={outputToken.balance}
      tokenList={tokenList}
    />
  );

  /* Switch Tokens Field */
  const switchField = (
    <IconButton
      onClick={() => {
        setFromValue(new BigNumber(-1));
        setToValue(new BigNumber(-1));
        setOrderIndex(!orderIndex);
        setFromToken(outputToken.token);
        setToToken(inputToken.token);
      }}
      style={{
        backgroundColor: '#D8DCDF',
        border: `5px solid ${theme.module.background}`,
        margin: '-50px 0',
        padding: '6px',
      }}
      color="primary"
    >
      {/* make separate component with class for onHover styling */}
      <UpDownIcon style={{ width: '60%' }} />
    </IconButton>
  );

  /* Transaction Details, settings and text */
  const frontrunTextField = settings.slippage.isLessThanOrEqualTo(
    SLIPPAGE_THRESHOLD
  ) ? (
    <FrontrunText />
  ) : null;
  const showSettings = (
    <SettingsFormModule
      settings={settings}
      setSettings={setSettings}
      showUnitModule={false}
      hasSlippage
    />
  );

  const expectedBeanPrice = getExpectedBeanPrice(
    fromValue,
    toValue
  );
  const fee = orderIndex
    ? fromValue.dividedBy(usdcPrice).multipliedBy(LP_FEE)
    : fromValue.multipliedBy(beanPrice).multipliedBy(LP_FEE);

  const textTransaction = orderIndex
    ? `Buy ${displayBN(
        toValue.multipliedBy(settings.slippage)
      )} ${outputToken.label} with ${fromValue.toFixed(
        4
      )} ${inputToken.label} for ${expectedBeanPrice.toFixed(
        4
      )} each`
    : `Buy ${toValue.toFixed(4)} ${outputToken.label} with ${displayBN(
        fromValue
      )} ${inputToken.label} for ${expectedBeanPrice.toFixed(4)} each`;

  function transactionDetails() {
    if (toValue.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <Box
          style={{
            fontFamily: 'Futura-PT-Book',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          {textTransaction}
        </Box>
        <SwapTransactionDetailsModule
          fields={{
            'Minimum Received': `${toValue
              .multipliedBy(settings.slippage)
              .toFixed(4)} ${outputToken.label}`,
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
      {transactionDetails()}
      {showSettings}
    </>
  );
}
