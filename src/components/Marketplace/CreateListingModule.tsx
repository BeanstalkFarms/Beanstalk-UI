import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { BASE_ETHERSCAN_ADDR_LINK, BEAN, theme } from 'constants/index';
import {
  displayBN,
  isAddress,
  toStringBaseUnitBN,
  MaxBN,
  MinBN,
  transferPlot,
  TrimBN,
} from 'util/index';
import {
  AddressInputField,
  ListInputField,
  PlotInputField,
  fieldStrings,
  TransactionDetailsModule,
} from 'components/Common';

export const CreateListingModule = forwardRef((props, ref) => {
  const [plotId, setPlotId] = useState(new BigNumber(-1));
  const [plotEndId, setPlotEndId] = useState(new BigNumber(-1));
  const [fromPlotIndex, setFromPlotIndex] = useState(new BigNumber(-1));
  const [toPlotEndIndex, setToPlotEndIndex] = useState(new BigNumber(-1));

  const width = window.innerWidth;

  /* Handlers: Plot change and update */
  function fromValueUpdated(newFromNumber: BigNumber) {
    setPlotEndId(TrimBN(newFromNumber, BEAN.decimals)); // set plot max pod size
    setToPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals));
  }
  function fromIndexValueUpdated(newFromIndexNumber: BigNumber, newToIndexNumber: BigNumber) {
    const newFromIndexValue = MinBN(
      new BigNumber(newFromIndexNumber),
      plotEndId
    );
    const newToEndIndexValue = MaxBN(
      newFromIndexValue,
      MinBN(new BigNumber(newToIndexNumber), plotEndId)
    );
    setFromPlotIndex(TrimBN(newFromIndexValue, BEAN.decimals));
    setToPlotEndIndex(TrimBN(newToEndIndexValue, BEAN.decimals));
  }
  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value]));
      setPlotId(event.target.value);
      setFromPlotIndex(new BigNumber(0)); // reset plot start index
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
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

  const maxHandler = () => {
    fromIndexValueUpdated(fromPlotIndex, plotEndId);
  };
  const minHandler = () => {
    fromIndexValueUpdated(MinBN(fromPlotIndex, new BigNumber(0)), plotEndId);
  };

  console.log('got plots:', props.plots)
  /* Input Fields */
  const fromPlotField = (
    <ListInputField
      index={props.index}
      items={props.plots ? props.plots : {}}
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

  return (
    <>
      {fromPlotField}
    </>
  );
});

export default CreateListingModule;
