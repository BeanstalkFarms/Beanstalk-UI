import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Box, Button, InputAdornment, TextField } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import {
  theme,
  BEAN,
  ETH,
} from 'constants/index';
import {
  getToAmount,
  SwapMode,
  TrimBN,
} from 'util/index';
import {
  EthInputField,
  TokenInputField,
} from 'components/Common';

export const CreateBuyOfferModule = (props) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [maxPlaceInLineValue, setMaxPlaceInLineValue] = useState(new BigNumber(-1));
  const [expiryValue, setExpiryValue] = useState(new BigNumber(-1));

  const classes = makeStyles(() => ({
    inputText: {
      fontSize: 'calc(15px + 1vmin)',
      fontFamily: 'Lucida Console',
      fontWeight: '400',
      color: theme.text,
    },
  }))();
  const smallLabels = {
    fontSize: 'calc(9px + 0.7vmin)',
    fontFamily: 'Futura-PT',
  };
  const leftStyle = {
    display: 'inline-block',
    float: 'left',
    fontFamily: 'Futura-PT-Book',
    marginLeft: '13px',
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
  };


  const { setBuyOffer } = props;
  useEffect(() => {
    const canBuy = toBuyBeanValue.isGreaterThan(0) &&
    pricePerPodValue.isGreaterThan(0) &&
    pricePerPodValue.isLessThan(1) &&
    maxPlaceInLineValue.isGreaterThan(0) &&
    expiryValue.isGreaterThan(0);
    if (canBuy) {
      setBuyOffer({
        pricePerPod: pricePerPodValue,
        fromEthValue,
        fromBeanValue,
        expiry: expiryValue,
        buyBeanAmount: toBuyBeanValue,
        maxPlaceInLine: maxPlaceInLineValue,
      });
    } else {
      setBuyOffer(null);
    }
  }, [setBuyOffer, fromBeanValue, fromEthValue, toBuyBeanValue, pricePerPodValue, maxPlaceInLineValue, expiryValue]);

  function fromValueUpdated(newFromNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      props.ethReserve,
      props.beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromNumber, BEAN.decimals));
  }

  /* Input Fields */
  const fromEthField = (
    <EthInputField
      key={1}
      balance={props.ethBalance}
      buyBeans={toBuyBeanValue}
      handleChange={(v) => {
        fromValueUpdated(fromBeanValue, v);
      }}
      sellEth={fromEthValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
      mode={SwapMode.BeanEthereum}
    />
  );
  const pricePerPodField = (
    <TokenInputField
      key={2}
      label="Price per pod"
      handleChange={(e) => {
        const newPricePerPodValue = new BigNumber(e.target.value);
        // Price can't be created than 1
        if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
          setPricePerPodValue(new BigNumber(0.999999));
          return;
        }
        setPricePerPodValue(newPricePerPodValue);
      }}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const maxPlaceInLineField = (
    <TokenInputField
      key={3}
      label="Max Place In Line"
      handleChange={(e) => {
        const newMaxPlaceInLineValue = new BigNumber(e.target.value);
        // Line can't be greater than current pod line
        // TODO: mock data, fix this (should be pod line - number of pods)
        if (newMaxPlaceInLineValue.isGreaterThanOrEqualTo(1000000)) {
          setMaxPlaceInLineValue(new BigNumber(1000000));
          return;
        }
        setMaxPlaceInLineValue(newMaxPlaceInLineValue);
      }}
      value={maxPlaceInLineValue}
      placeholder="1000000"
    />
  );
  const expiryField = (
    <Box style={{ margin: '8px 0' }}>
      <Box style={smallLabels}>
        <Box style={leftStyle}>Expiry</Box>
      </Box>
      <TextField
        className="TextField-rounded"
        placeholder="50000000"
        variant="outlined"
        size="medium"
        type="number"
        value={
          expiryValue.isNegative()
          ? ''
          : (expiryValue.length > 1 &&
            expiryValue.replaceAll('0', '').length === 0) ||
          (props.value.toFixed() === '0' && expiryValue === '') ||
          (expiryValue.indexOf('.') > -1 &&
            expiryValue.lastIndexOf('0') === expiryValue.length - 1)
          ? expiryValue
          : props.value.toFixed()
        }
        onChange={(e) => {
          console.log('got target: value:', e.target.value);
          setExpiryValue(new BigNumber(e.target.value))
        }}
        onWheel={(e) => e.target.blur()}
        onKeyDown={(e) =>
        (e.key === 'e' || e.key === '+' || e.key === '-') &&
          e.preventDefault()
        }
        fullWidth
        InputProps={{
          inputProps: {
            min: 0.0,
              step: 1.0,
              inputMode: 'decimal',
          },
          classes: {
            input: classes.inputText,
          }
          }}
      />
    </Box>
  )

  return (
    <>
      {fromEthField}
      {pricePerPodField}
      {maxPlaceInLineField}
      {expiryField}
    </>
  );
};
