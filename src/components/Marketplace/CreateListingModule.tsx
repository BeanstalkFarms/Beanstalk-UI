import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { BEAN } from 'constants/index';
import {
  MaxBN,
  MinBN,
  TrimBN,
} from 'util/index';
import {
  ListInputField,
  TokenInputField,
  PlotInputField,
} from 'components/Common';

export const CreateListingModule = (props) => {
  const [plotEndId, setPlotEndId] = useState(new BigNumber(-1));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [fromPlotIndex, setFromPlotIndex] = useState(new BigNumber(-1));
  const [toPlotEndIndex, setToPlotEndIndex] = useState(new BigNumber(-1));

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
      setFromPlotIndex(new BigNumber(0)); // reset plot start index
    } else {
      fromValueUpdated(new BigNumber(-1));
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

  /* Input Fields */
  const fromPlotField = (
    <ListInputField
      index={props.index}
      items={props.plots ? props.plots : {}}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handleFromChange}
      label="Select plot to sell"
    />
  );
  const priceField = (
    <TokenInputField
      label="Price per Pod"
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
  const fromIndexEndField = (
    <PlotInputField
      key={0}
      hidden={props.isFormDisabled && !fromPlotIndex.isEqualTo(toPlotEndIndex)}
      balance={plotEndId}
      handleChange={handleFromIndexEndChange}
      label="Amount"
      value={toPlotEndIndex}
      maxHandler={maxHandler}
    />
  );

  return (
    <>
      {fromPlotField}
      {priceField}
      {fromIndexEndField}
    </>
  );
};

export default CreateListingModule;
