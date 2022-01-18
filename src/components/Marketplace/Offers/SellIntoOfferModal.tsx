import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  Modal,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { TrimBN, beanstalkContract, displayBN, FarmAsset, SiloAsset } from 'util/index';
import { BaseModule, PlotListInputField, TokenInputField, TokenOutputField, TransactionDetailsModule } from 'components/Common';
import { BuyOffer } from 'state/marketplace/reducer';

type SellIntoOfferModalProps = {
  currentOffer: BuyOffer;
  onClose: Function;
}

export default function SellIntoOfferModal({ currentOffer, onClose }: SellIntoOfferModalProps) {
  const [index, setIndex] = useState(new BigNumber(-1));
  const [amount, setAmount] = useState(new BigNumber(0));
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { plots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  // Derived values
  const leftMargin = width < 800 ? 0 : 120;

  // If no offer selected, exit
  if (currentOffer == null) {
    return null;
  }

  //
  const validPlotIndices = Object.keys(plots).filter((plotIndex) => {
    const harvestIndex = harvestableIndex;
    const plotObjectiveIndex = new BigNumber(plotIndex);
    return plotObjectiveIndex.minus(harvestIndex).lt(currentOffer.maxPlaceInLine);
  });
  const validPlots = validPlotIndices.reduce((prev, curr) => (
    {
      ...prev,
      [curr]: plots[curr],
    }
  ), {});

  //
  const getMaxAmountCanSell = (selectedPlotIndex: BigNumber) => (
    selectedPlotIndex.gt(0)
      ? BigNumber.minimum(
        // The total amount requested by the buyer
        currentOffer.amount,
        // The number of pods in this plot that we can sell into the offer
        // Ex. User A creates a Buy Offer with relatiive index 100,000.
        //     I have a plot at index 99,900 with 200 plots in it.
        //     Only 100 of these are eligible to sell.
        (currentOffer.maxPlaceInLine.minus(harvestableIndex)).minus(plots[selectedPlotIndex]),
        // The total number of pods in the seller's plot.
        plots[selectedPlotIndex]
      )
      : new BigNumber(0)
  );

  // Handle plot change
  const handlePlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value === 'default') {
      setIndex(new BigNumber(-1));
      setAmount(new BigNumber(0));
      return;
    }
    const newIndex = new BigNumber(event.target.value);
    const maxAmountCanSell = getMaxAmountCanSell(newIndex);
    setIndex(newIndex);
    setAmount(maxAmountCanSell);
  };

  // Handle form submission
  const handleForm = async () => {
    const beanstalk = beanstalkContract();
    const finalIndex = index.times(10 ** 6);
    const end = finalIndex.plus(new BigNumber(plots[index]).times(10 ** 6));
    const finalAmount = amount.times(10 ** 6);
    const sellFromIndex = end.minus(finalAmount);
    const buyOfferIndex = currentOffer.index;
    await beanstalk.sellToBuyOffer(
      finalIndex.toFixed(),
      sellFromIndex.toFixed(),
      buyOfferIndex.toFixed(),
      finalAmount.toFixed()
    );
  };

  // Max amount that you can sell
  // currentOffer.maxPlaceInLine = the max place in line the buyer is willing to buy from
  // (i.e. can only sell if plot is before this)
  const maxAmountCanSell = getMaxAmountCanSell(index);
  const beansReceived = amount.times(currentOffer.pricePerPod);

  // Details
  const details : string[] = [];
  if (index && index.gt(0)) {
    details.push(`Sell ${displayBN(amount)} Pods out of ${displayBN(plots[index])} from your plot at ${displayBN(index.minus(harvestableIndex))} in line.`);
    details.push(`Receive ${displayBN(beansReceived)} Beans.`);
    details.push('This sale will settle immediately.');
  }
  function transactionDetails() {
    return (
      <>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  return (
    <Modal
      open={currentOffer != null}
      onClose={onClose}
    >
      <BaseModule
        style={{
          position: 'absolute',
          top: '50%',
          marginTop: '-40px',
          width: '400px',
          left: '50%',
          marginLeft: `${leftMargin}px`,
          textAlign: 'center',
          transform: 'translate(-50%, -50%)',
        }}
        section={0}
        sectionTitles={['Sell Plot']}
        size="small"
        marginTop="0px"
        handleForm={handleForm}
      >
        <div>
          <p>Max place in line</p>
          <p>{currentOffer.maxPlaceInLine.toFixed()}</p>
        </div>
        <div>
          <p>Price per pod</p>
          <p>{currentOffer.pricePerPod.toFixed()}</p>
        </div>
        <div>
          <p>Amount available to sell</p>
          <p>{currentOffer.amount.toFixed()}</p>
        </div>
        <PlotListInputField
          index={parseFloat(harvestableIndex)}
          items={validPlots}
          handleChange={handlePlotChange}
          label="Select plot"
          type="sell"
          descriptor="eligible"
          style={{ marginBottom: 10 }}
        />
        <TokenInputField
          key={2}
          label="Number of Pods to Sell"
          token={FarmAsset.Pods}
          maxHandler={() => setAmount(maxAmountCanSell)}
          handleChange={(e) => {
            const newAmount = new BigNumber(e.target.value);
            if (newAmount.isGreaterThanOrEqualTo(maxAmountCanSell)) {
              setAmount(maxAmountCanSell);
              return;
            }
            setAmount(newAmount);
          }}
          value={TrimBN(amount, 6)}
        />
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <TokenOutputField
          title="Recieved Beans"
          mint
          token={SiloAsset.Bean}
          value={beansReceived}
        />
        {/* <TokenInputField
          key={2}
          label="Amount"
          token={CryptoAsset.Bean}
          // maxHandler={() => setAmount(maxAmountCanSell)}
          // handleChange={(e) => {
          //   const newAmount = new BigNumber(e.target.value);
          //   if (newAmount.isGreaterThanOrEqualTo(maxAmountCanSell)) {
          //     setAmount(maxAmountCanSell);
          //     return;
          //   }
          //   setAmount(newAmount);
          // }}
          // value={TrimBN(amount, 6)}
        /> */}
        {transactionDetails()}
      </BaseModule>
    </Modal>
  );
}
