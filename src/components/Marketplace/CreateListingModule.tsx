import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
// import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AppState } from 'state';
import { useSelector } from 'react-redux';

import {
  ListInputField,
  TokenInputField,
  PlotInputField,
  TransactionDetailsModule,
} from 'components/Common';
import { TrimBN, displayBN, CryptoAsset, FarmAsset } from 'util/index';

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
      token={CryptoAsset.Bean}
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
    <TokenInputField
      label="Amount"
      token={FarmAsset.Pods}
      handleChange={(e) => {
        setAmount(new BigNumber(e.target.value));
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
    `List ${displayBN(amount)} Pods from plot at index ${displayBN(index)} for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod.`,
    `If fully sold, you will receive ${displayBN(amount.multipliedBy(pricePerPodValue))} Beans.`,
    `This listing will expire when ${displayBN(expiresIn)} additional Pods have been harvested. The total amount of pods harvested at this time will be ${displayBN(expiresIn.plus(harvestableIndex))}.`,
  ];
  // if (settings.claim) {
  //   details.push(
  //     <ClaimTextModule
  //       key="claim"
  //       claim={settings.claim}
  //       beanClaimable={beanClaimable}
  //       ethClaimable={ethClaimable}
  //     />
  //   );
  // }
  // if (
  //   settings.mode === SwapMode.Ethereum ||
  //   (settings.mode === SwapMode.BeanEthereum &&
  //     toBuyBeanValue.isGreaterThan(0))
  // ) {
  //   details.push(
  //     <TransactionTextModule
  //       key="buy"
  //       balance={toBuyBeanValue}
  //       buyBeans={toBuyBeanValue}
  //       claim={settings.claim}
  //       claimableBalance={ethClaimable}
  //       mode={settings.mode}
  //       sellEth={fromEthValue}
  //       updateExpectedPrice={updateExpectedPrice}
  //       value={TrimBN(fromEthValue, 9)}
  //     />
  //   );
  // }
  // details.push(
  //   `Place a buy offer for ${displayBN(
  //     toPodValue
  //   )} Pods anywhere before ${displayBN(maxPlaceInLineValue)} in the Pod line at
  //   ${pricePerPodValue.toFixed(2)} price per Pod`
  // );
  // details.push(
  //   `${displayBN(toBuyBeanValue.plus(MaxBN(fromBeanValue, new BigNumber(0))))} Beans
  //   will be locked in the Marketplace to allow for order fulfillment.`
  // );
  // details.push(
  //   `Your offer will expire after ${displayBN(maxPlaceInLineValue)} Pods are harvested from the Pod line`
  // );

  function transactionDetails() {
    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-7px', width: '100%' }}
        />
        {/* {toPodField} */}
        <TransactionDetailsModule fields={details} />
        {/* <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span style={{ fontSize: 'calc(9px + 0.5vmin)' }}>
            You can cancel the offer to return the locked Beans from the marketplace
          </span>
        </Box> */}
      </>
    );
  }

  return (
    <>
      {fromPlotField}
      {priceField}
      {amountField}
      {expiresInField}
      {transactionDetails()}
    </>
  );
};

export default CreateListingModule;
