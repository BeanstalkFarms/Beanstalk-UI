import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { TrimBN } from 'util/index';
import {
  ListInputField,
  TokenInputField,
  PlotInputField,
} from 'components/Common';
import { AppState } from 'state';
import { useSelector } from 'react-redux';

export const CreateListingModule = (props) => {
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const [index, setIndex] = useState(new BigNumber(-1));
  const [amount, setAmount] = useState(new BigNumber(-1));
  const [expiresIn, setExpiresIn] = useState(new BigNumber(-1));

  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));

  const { setSellOffer } = props;
  useEffect(() => {
    // TODO: rest
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

  const handlePlotChange = (event) => {
    setIndex(new BigNumber(event.target.value));
    setAmount(new BigNumber(props.plots[event.target.value]));
  };
  const maxHandler = () => {
    if (index != null) {
      setAmount(new BigNumber(props.plots[index.toString()]));
    }
  };

  /* Input Fields */
  const fromPlotField = (
    <ListInputField
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

  const expiresInField = (
    <>
      <TokenInputField
        label="Expires In"
        handleChange={(e) => {
          const newExpiresinValue = new BigNumber(e.target.value);
          console.log('index', index.toNumber());
          console.log('newExpiresinValue', newExpiresinValue.toNumber());
          console.log('harvestableIndex', harvestableIndex.toNumber());

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
      <h2>This will expire</h2>
    </>
  );
  const amountField = (
    <PlotInputField
      key={0}
      handleChange={(e) => {
        setAmount(new BigNumber(e.target.value));
      }}
      label="Amount"
      value={amount}
      maxHandler={maxHandler}
    />
  );

  return (
    <>
      {fromPlotField}
      {priceField}
      {amountField}
      {expiresInField}
    </>
  );
};

export default CreateListingModule;
