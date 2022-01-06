import React, { useEffect, useState } from 'react';
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
  const [index, setIndex] = useState(new BigNumber(-1));
  const [amount, setAmount] = useState(new BigNumber(-1));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));

  const { setSellOffer } = props;
  useEffect(() => {
    // TODO: rest
    const canSell = pricePerPodValue.isLessThan(1)
    if (canSell) {
      setSellOffer({
        index,
        pricePerPod: pricePerPodValue,
        amount,
      });
    } else {
      setSellOffer(null);
    }
  }, [index, setSellOffer, pricePerPodValue, amount]);

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
  const amountField = (
    <PlotInputField
      key={0}
      handleChange={(e) => {
        setAmount(new BigNumber(e.target.value))
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
    </>
  );
};

export default CreateListingModule;
