import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { BEAN } from 'constants/index';
import {
  displayBN,
  // toStringBaseUnitBN,
  MaxBN,
  MinBN,
  TrimBN,
} from 'util/index';
import {
  ListInputField,
  PlotInputField,
  TokenInputField,
  TransactionDetailsModule,
} from 'components/Common';

export const PlotSellModule = forwardRef((props, ref) => {
  const [plotId, setPlotId] = useState(new BigNumber(-1));
  const [plotEndId, setPlotEndId] = useState(new BigNumber(-1));
  const [fromPlotIndex, setFromPlotIndex] = useState(new BigNumber(-1));
  const [toPlotEndIndex, setToPlotEndIndex] = useState(new BigNumber(-1));

  const width = window.innerWidth;

  /* Handlers: Plot change and update */
  function fromValueUpdated(newFromNumber: BigNumber) {
    setPlotEndId(TrimBN(newFromNumber, BEAN.decimals)); // set plot max pod size
    setToPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals));
    props.setIsFormDisabled(newFromNumber.isLessThanOrEqualTo(0));
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
    props.setIsFormDisabled(newFromIndexValue.isEqualTo(newToEndIndexValue));
    setFromPlotIndex(TrimBN(newFromIndexValue, BEAN.decimals));
    setToPlotEndIndex(TrimBN(newToEndIndexValue, BEAN.decimals));
  }
  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value]));
      setPlotId(event.target.value);
      setFromPlotIndex(new BigNumber(0)); // reset plot start index
      if (props.plots[event.target.value] === undefined) {
        props.setIsFormDisabled(true);
        // fromValueUpdated(new BigNumber(-1));
      }
    } else {
      fromValueUpdated(new BigNumber(-1));
      props.setIsFormDisabled(true);
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

  const handlePriceChange = () => {};
  const priceValueUpdated = (newPriceNumber: BigNumber) => {
    console.log(newPriceNumber);
    // const fromReserve = props.orderIndex ? props.ethReserve : props.beanReserve;
    // const toReserve = props.orderIndex ? props.beanReserve : props.ethReserve;
    // const toNumber = MinBN(newToNumber, toReserve);
    // const proposedNewFromValue = getFromAmount(
    //   toNumber,
    //   fromReserve,
    //   toReserve,
    //   props.orderIndex ? ETH.decimals : BEAN.decimals
    // );
    // if (proposedNewFromValue.isGreaterThan(props.maxFromVal)) {
    //   fromValueUpdated(props.maxFromVal);
    // } else {
    //   props.setFromValue(
    //     TrimBN(
    //       proposedNewFromValue,
    //       props.orderIndex ? ETH.decimals : BEAN.decimals
    //     )
    //   );
    //   props.setToValue(
    //     TrimBN(toNumber, props.orderIndex ? BEAN.decimals : ETH.decimals)
    //   );
    // }
  };

  /* Handlers: Address change and update */
  const maxHandler = () => {
    fromIndexValueUpdated(fromPlotIndex, plotEndId);
  };
  const minHandler = () => {
    fromIndexValueUpdated(MinBN(fromPlotIndex, new BigNumber(0)), plotEndId);
  };

  /* Input Fields */
  const fromPlotField = (
    <ListInputField
      label="Select Plot to Sell"
      index={props.index}
      items={props.plots}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handleFromChange}
    />
  );
  const priceField = (
    <TokenInputField
      label="Price per Pod"
      value={TrimBN(props.toValue, BEAN.decimals)}
      setValue={priceValueUpdated}
      handleChange={handlePriceChange}
      // token={props.toToken}
      balance={new BigNumber(0)}
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
  let details = [];
  function displaySendPlot(firstText: string, secondText: string) {
    details.push(
      <span>
        {`Send ${firstText}Plot #${displayBN(
          new BigNumber(plotId - props.index).plus(fromPlotIndex)
        )} to `}
      </span>
    );
    details.push(`Send ${firstText === '' ? 'all' : ''}
      ${displayBN(toPlotEndIndex)} Pods ${secondText} the Plot`);
  }

  if (toPlotEndIndex.minus(fromPlotIndex).isEqualTo(plotEndId)) {
    // full plot
    displaySendPlot('', 'in');
  } else if (fromPlotIndex.isEqualTo(0)) {
    // front of plot
    displaySendPlot('part of ', 'from the front of');
  } else if (toPlotEndIndex.isEqualTo(plotEndId)) {
    // back of plot
    displaySendPlot('part of ', 'from the end of');
  } else if (
    !toPlotEndIndex.minus(fromPlotIndex).isEqualTo(plotEndId) &&
    !fromPlotIndex.isEqualTo(0)
  ) {
    // middle of plot
    displaySendPlot('part of ', 'in the middle of');
  }

  if (toPlotEndIndex.isEqualTo(fromPlotIndex)) {
    details = [<span style={{ color: 'red' }}>Invalid transfer amount</span>];
  }

  /* */
  function TransactionDetails() {
    if (toPlotEndIndex.isLessThanOrEqualTo(0)) return null;
    return (
      <>
        <Box style={
          width > 500
            ? { display: 'inline-flex' }
            : { display: 'inline-block' }
        }>
          <Box style={{ marginRight: '5px' }}>{fromIndexField}</Box>
          <Box style={{ marginLeft: '5px' }}>{fromIndexEndField}</Box>
        </Box>
        <TransactionDetailsModule
          fields={details}
        />
      </>
    );
  }

  /* */
  useImperativeHandle(ref, () => ({
    handleForm() {
      console.log('Nothing here yet');
    },
  }));

  return (
    <>
      {fromPlotField}
      {priceField}
      <TransactionDetails />
    </>
  );
});
