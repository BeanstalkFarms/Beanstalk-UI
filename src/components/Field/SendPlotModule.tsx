import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { BEAN } from '../../constants';
import {
  isAddress,
  toStringBaseUnitBN,
  MaxBN,
  MinBN,
  transferPlot,
  TrimBN,
} from '../../util';
import { AddressInputField, PlotInputField, ListInputField } from '../Common';

export const SendPlotModule = forwardRef((props, ref) => {
  const [plotId, setPlotId] = useState(new BigNumber(-1));
  const [plotEndId, setPlotEndId] = useState(new BigNumber(-1));
  const [fromPlotIndex, setFromPlotIndex] = useState(new BigNumber(-1));
  const [toPlotEndIndex, setToPlotEndIndex] = useState(new BigNumber(-1));

  const [snappedToAddress, setSnappedToAddress] = useState(false);
  const [walletText, setWalletText] = useState('');

  const width = window.innerWidth;

  // Plot handle change and update

  function fromValueUpdated(newFromNumber) {
    setPlotEndId(TrimBN(newFromNumber, BEAN.decimals)); // set plot max pod size
    setToPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals));
    props.setIsFormDisabled(newFromNumber.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value])); // gives you the value at the selected plot pod value
      setPlotId(event.target.value); // plot id
      setFromPlotIndex(new BigNumber(0)); // reset plot start index
      if (props.plots[event.target.value] === undefined) {
        props.setIsFormDisabled(true);
      }
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };

  function fromIndexValueUpdated(newFromIndexNumber, newToIndexNumber) {
    const newFromIndexValue = MinBN(
      new BigNumber(newFromIndexNumber),
      plotEndId
    );
    const newToEndIndexValue = MaxBN(
      newFromIndexValue,
      MinBN(new BigNumber(newToIndexNumber), plotEndId)
    );
    props.setIsFormDisabled(newFromIndexValue.isEqualTo(newToEndIndexValue));
    setFromPlotIndex(TrimBN(newFromIndexValue, BEAN.decimals));
    setToPlotEndIndex(TrimBN(newToEndIndexValue, BEAN.decimals));
  }

  const handleFromIndexChange = (event) => {
    if (event.target.value) {
      fromIndexValueUpdated(event.target.value, toPlotEndIndex);
    } else {
      fromIndexValueUpdated(new BigNumber(0), toPlotEndIndex);
    }
  };
  const handleFromIndexEndChange = (event) => {
    if (event.target.value) {
      fromIndexValueUpdated(fromPlotIndex, event.target.value);
    } else {
      fromIndexValueUpdated(fromPlotIndex, plotEndId);
    }
  };

  // Address handle change and update

  async function toAddressUpdated(newToAddress) {
    if (snappedToAddress) {
      fromValueUpdated(new BigNumber(-1));
      props.setToAddress('');
      setWalletText('');
      setSnappedToAddress(false);
      return;
    }

    if (newToAddress.length === 42) {
      setWalletText(
        `${newToAddress.substring(0, 6)}...${newToAddress.substring(
          newToAddress.length - 4
        )}`
      );
      setSnappedToAddress(true);
      props.setIsValidAddress(await isAddress(newToAddress));
    } else {
      setWalletText('');
      props.setIsFormDisabled(true);
    }
    props.setToAddress(newToAddress);
  }

  const handleChange = (event) => {
    if (event.target.value) {
      toAddressUpdated(event.target.value);
    } else {
      toAddressUpdated('');
    }
  };

  const clearHandler = () => {
    toAddressUpdated(walletText);
  };

  const maxHandler = () => {
    fromIndexValueUpdated(fromPlotIndex, plotEndId);
  };
  const minHandler = () => {
    fromIndexValueUpdated(MinBN(fromPlotIndex, new BigNumber(0)), plotEndId);
  };

  console.log();

  /* Input Fields */

  const toAddressField = (
    <AddressInputField
      address={walletText}
      setAddress={setWalletText}
      handleChange={handleChange}
      marginTop={window.innerWidth > 400 ? '8px' : '7px'}
      snapped={snappedToAddress}
      handleClear={clearHandler}
      isValidAddress={props.isValidAddress}
    />
  );
  const fromPlotField = (
    <ListInputField
      hidden={
        props.toAddress.length !== 42 ||
        walletText === '' ||
        props.isValidAddress !== true
      }
      index={props.index}
      items={props.plots}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handleFromChange}
    />
  );
  const fromIndexField = (
    <PlotInputField
      key={0}
      hidden={props.isFormDisabled && !fromPlotIndex.isEqualTo(toPlotEndIndex)}
      balance={plotEndId}
      handleChange={handleFromIndexChange}
      label="Start Index"
      value={new BigNumber(fromPlotIndex)}
      minHandler={minHandler}
    />
  );
  const fromIndexEndField = (
    <PlotInputField
      key={0}
      hidden={props.isFormDisabled && !fromPlotIndex.isEqualTo(toPlotEndIndex)}
      balance={plotEndId}
      handleChange={handleFromIndexEndChange}
      label="End Index"
      value={toPlotEndIndex}
      maxHandler={maxHandler}
    />
  );

  /* Transaction Details, settings and text */

  const plotText = toPlotEndIndex.minus(fromPlotIndex).isEqualTo(plotEndId) ?
    `You will send the full plot of ${toPlotEndIndex} pods.`
    : toPlotEndIndex.isEqualTo(fromPlotIndex)
    ? 'Invalid transfer amount'
    : `You will send a partial plot with pods from index ${fromPlotIndex} to index ${toPlotEndIndex}.`;

  const sendText = toPlotEndIndex.toFixed() !== 'NaN' ?
    <Box style={{ display: 'inline-block', width: '100%' }}>
      <span>
        {plotText}
      </span>
    </Box>
    : null;

  function transactionDetails() {
    if (toPlotEndIndex.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <Box style={width > 500 ? { display: 'inline-flex' } : { display: 'inline-block' }}>
          <Box style={{ marginRight: '5px' }}>{fromIndexField}</Box>
          <Box style={{ marginLeft: '5px' }}>{fromIndexEndField}</Box>
        </Box>
        {sendText}
        <Box style={{ display: 'inline-block', width: '100%', color: 'red' }}>
          <span>
            WARNING: Beanstalk doesn&apos;t currently support a market for
            buying and selling Plots. Use at your own risk.
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPlotEndIndex.isLessThanOrEqualTo(0)) return;

      if (toPlotEndIndex.isGreaterThan(0)) {
        const startPlot = toStringBaseUnitBN(fromPlotIndex, BEAN.decimals);
        const endPlot = toStringBaseUnitBN(toPlotEndIndex, BEAN.decimals);
        const id = toStringBaseUnitBN(plotId, BEAN.decimals);
        transferPlot(props.toAddress, id, startPlot, endPlot, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
        });
      } else {
        fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
      }
    },
  }));

  return (
    <>
      {toAddressField}
      {fromPlotField}
      {transactionDetails()}
    </>
  );
});
