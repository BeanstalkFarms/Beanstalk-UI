import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  Modal,
} from '@material-ui/core';
import { FarmAsset, TrimBN, getToAmount, getFromAmount, poolForLP, CryptoAsset, SwapMode, MinBN, displayBN, MaxBN, toBaseUnitBN, toStringBaseUnitBN, buyListing, buyBeansAndBuyListing } from 'util/index';
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
    setIndex(new BigNumber(event.target.value));
    setAmount(new BigNumber(plots[event.target.value]));
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
        handleForm={() => {}}
      >
        <div>
          <p>Max place in line</p>
          <p>{currentOffer.maxPlaceInLine.toFixed()}</p>
        </div>
        <div>
          <p>Price per pod</p>
          <p>{currentOffer.pricePerPod.toFixed()}</p>
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
          handleChange={(e) => {
            const newAmount = new BigNumber(e.target.value);
            // Price can't be created than 1
            if (newAmount.isGreaterThanOrEqualTo(1)) {
              setAmount(currentOffer.amount);
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
