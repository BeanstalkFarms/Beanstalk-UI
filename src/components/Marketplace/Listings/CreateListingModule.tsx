import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
// import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AppState } from 'state';
import { useSelector } from 'react-redux';

import {
  PlotListInputField,
  TokenInputField,
  PlotInputField,
  TransactionDetailsModule,
} from 'components/Common';
import { TrimBN, displayBN, CryptoAsset, FarmAsset } from 'util/index';

type CreateListingModuleProps = {
  plots: AppState['userBalance']['plots'];
  hasPlots: boolean;
  index: any; // FIXME
  setSellOffer: Function;
}

export const CreateListingModule = (props: CreateListingModuleProps) => {
  /** The absolute index of the selected plot in line. */
  const [index, setIndex] = useState(new BigNumber(-1));
  /** The amount of Pod listed from the plot. */
  const [amount, setAmount] = useState(new BigNumber(-1));
  /** How far forward the Pod line needs to move before the offer expire. */
  const [expiresIn, setExpiresIn] = useState(new BigNumber(-1));
  /** The price per pod. */
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));

  //
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // destructed to avoid useEffect dependency error
  const { setSellOffer } = props;
  const selectedPlotPositionInLine = index.minus(harvestableIndex);
  const amountInSelectedPlot = index ? new BigNumber(props.plots[index.toString()]) : new BigNumber(-1);

  // Whenever this form is updated, propagate changes back
  // to MarketplaceSellModule.
  useEffect(() => {
    // TODO: rest (???)
    const canSell = pricePerPodValue.isLessThan(1);
    if (canSell) {
      setSellOffer({
        index,
        pricePerPod: pricePerPodValue,
        amount,
        expiresIn,
      });
    } else {
      setSellOffer(null);
    }
  }, [index, setSellOffer, pricePerPodValue, amount, expiresIn]);

  /** */
  const handlePlotChange = (event) => {
    setIndex(new BigNumber(event.target.value));
    setAmount(new BigNumber(props.plots[event.target.value]));
  };

  /** */
  const maxHandler = () => {
    if (index != null) {
      setAmount(amountInSelectedPlot);
    }
  };

  /* Input Fields */
  const fromPlotField = (
    <PlotListInputField
      index={props.index}
      items={props.plots ? props.plots : {}}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handlePlotChange}
      label="Select plot to sell"
      type="sell"
    />
  );
  const priceField = (
    <TokenInputField
      label="Price per Pod"
      token={CryptoAsset.Bean}
      handleChange={(event) => {
        const newPricePerPodValue = new BigNumber(event.target.value);
        // CONSTRAINT: Price can't be created than 1
        if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
          setPricePerPodValue(new BigNumber(0.999999));
          return;
        }
        setPricePerPodValue(newPricePerPodValue);
      }}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const amountField = (
    <TokenInputField
      label="Amount"
      token={FarmAsset.Pods}
      handleChange={(event) => {
        const v = new BigNumber(event.target.value);
        // CONSTRAINT: Amount can't be greater than size of selected plot.
        if (amountInSelectedPlot.lt(v)) {
          setAmount(amountInSelectedPlot);
          return;
        }
        setAmount(v);
      }}
      value={amount}
      maxHandler={maxHandler}
    />
  );
  const expiresInField = (
    <>
      <PlotInputField
        label="Expires In"
        handleChange={(e) => {
          const newExpiresinValue = new BigNumber(e.target.value);
          // console.log('index', index.toNumber());
          // console.log('newExpiresinValue', newExpiresinValue.toNumber());
          // console.log('harvestableIndex', harvestableIndex.toNumber());

          // Price can't be created than 1
          if (
            index != null &&
            newExpiresinValue.isGreaterThanOrEqualTo(index.minus(harvestableIndex))
          ) {
            setExpiresIn(index.minus(harvestableIndex));
          } else {
            setExpiresIn(newExpiresinValue);
          }
        }}
        value={TrimBN(expiresIn, 6)}
        maxHandler={() => {
          if (index != null) {
            setExpiresIn(index.minus(harvestableIndex));
          }
        }}
      />
    </>
  );

  const details = [
    `List ${displayBN(amount)} Pods from plot at position ${displayBN(selectedPlotPositionInLine)} in line for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod.`,
    `If fully sold, you will receive ${displayBN(amount.multipliedBy(pricePerPodValue))} Beans.`,
    `This listing will expire when ${displayBN(expiresIn)} additional Pods have been harvested. The total amount of pods harvested at this time will be ${displayBN(expiresIn.plus(harvestableIndex))}.`,
  ];

  function transactionDetails() {
    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-7px', width: '100%' }}
        />
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  return (
    <>
      {fromPlotField}
      {index.gte(0) ? (
        <>
          {priceField}
          {amountField}
          {expiresInField}
          {transactionDetails()}
        </>
      ) : null}
    </>
  );
};

export default CreateListingModule;
