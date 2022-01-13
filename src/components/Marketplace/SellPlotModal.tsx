import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  Modal,
} from '@material-ui/core';
import { FarmAsset, TrimBN, getToAmount, getFromAmount, poolForLP, CryptoAsset, SwapMode, MinBN, displayBN, MaxBN, toBaseUnitBN, toStringBaseUnitBN, buyListing, buyBeansAndBuyListing, beanstalkContract } from 'util/index';
import { BaseModule, ListInputField, TokenInputField, ClaimTextModule, EthInputField, InputFieldPlus, SettingsFormModule, TransactionDetailsModule, TransactionTextModule } from 'components/Common';

export default function SellPlotModal({
  currentOffer,
  onClose,
}) {
  const [index, setIndex] = useState(new BigNumber(-1));
  const [amount, setAmount] = useState(new BigNumber(0));
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const {
    plots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );


  const leftMargin = width < 800 ? 0 : 120;
  if (currentOffer == null) {
    return null
  }

  const handlePlotChange = (event) => {
    if (event.target.value === 'default') {
      setIndex(new BigNumber(-1));
      setAmount(new BigNumber(0));
      return
    }
    const newIndex = new BigNumber(event.target.value);
    setIndex(newIndex);
    const maxAmountCanSell = newIndex.gt(-1) ? BigNumber.minimum(currentOffer.amount, currentOffer.maxPlaceInLine.times(10 ** 6).minus(harvestableIndex.times(10 ** 6)).minus(plots[newIndex])) : new BigNumber(0)
    setAmount(maxAmountCanSell);
  };

  const validPlotIndices = Object.keys(plots).filter((plotIndex) => {
    const harvestIndex = harvestableIndex.times(10 ** 6)
    const plotObjectiveIndex = new BigNumber(plotIndex).times(10 ** 6)
    return plotObjectiveIndex.minus(harvestIndex).lt(currentOffer.maxPlaceInLine.times(10 ** 6))
  })
  const validPlots = validPlotIndices.reduce((prev, curr) => {
    return {
      ...prev,
      [curr]: plots[curr],
    }
  }, {})

  const handleForm = async () => {
    const beanstalk = beanstalkContract()

    console.log('selling:')
    const finalIndex = index.times(10 ** 6)
    console.log('index:', finalIndex.toString());
    const end = finalIndex.plus(new BigNumber(plots[index]).times(10 ** 6));
    const finalAmount = amount.times(10 ** 6)
    const sellFromIndex = end.minus(finalAmount);
    console.log('sell from index:', sellFromIndex.toString());
    const buyOfferIndex = currentOffer.index;
    console.log('buy offer index:', buyOfferIndex.toString())
    console.log('amount:', finalAmount.toString())
    await beanstalk.sellToBuyOffer(
      finalIndex.toFixed(),
      sellFromIndex.toFixed(),
      buyOfferIndex.toFixed(),
      finalAmount.toFixed(),
    );
  }

  // Max amount that you can sell
  const maxAmountCanSell = index.gt(0) ? BigNumber.minimum(currentOffer.amount, currentOffer.maxPlaceInLine.times(10 ** 6).minus(harvestableIndex.times(10 ** 6)).minus(plots[index])) : new BigNumber(0)

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
        <ListInputField
          index={parseFloat(harvestableIndex)}
          items={validPlots}
          handleChange={handlePlotChange}
          label="Select plot to sell"
          type="sell"
        />
        <TokenInputField
          key={2}
          label="Amount"
          token={CryptoAsset.Bean}
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
      </BaseModule>
    </Modal>
  );
}
