import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
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
import { TrimBN, displayBN, CryptoAsset, FarmAsset, GetWalletAddress } from 'util/index';
import { Listing } from 'state/marketplace/reducer';
import ListingsTable from './ListingsTable';

type CreateListingModuleProps = {
  // harvestableIndex: AppState['weather']['harvestableIndex'];
  plots: AppState['userBalance']['plots'];
  hasPlots: boolean;
  setListing: Function;
  readyToSubmit: boolean;
}

export const CreateListingModule = forwardRef((props: CreateListingModuleProps, ref) => {
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { listings: allListings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  /** The absolute index of the selected plot in line. */
  const [index, setIndex] = useState(new BigNumber(-1));
  /** The amount of Pod listed from the plot. */
  const [amount, setAmount] = useState(new BigNumber(-1));
  /** How far forward the Pod line needs to move before the offer expire. */
  const [expiresIn, setExpiresIn] = useState(new BigNumber(-1));
  /** The price per pod. */
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));

  const { setListing } = props; // Destructed to avoid useEffect dependency error
  const selectedPlotPositionInLine = index.minus(harvestableIndex);
  const amountInSelectedPlot = index ? new BigNumber(props.plots[index.toString()]) : new BigNumber(-1);

  // Whenever this form is updated, propagate changes back
  // to MarketplaceSellModule.
  useEffect(() => {
    // TODO: rest (???)
    const canSell = pricePerPodValue.isLessThanOrEqualTo(1);
    if (canSell) {
      setListing({
        index,
        pricePerPod: pricePerPodValue,
        amount,
        expiresIn,
      });
    } else {
      setListing(null);
    }
  }, [index, setListing, pricePerPodValue, amount, expiresIn]);

  /** */
  const handlePlotChange = (event) => {
    const newIndex = new BigNumber(event.target.value);
    const newAmount = new BigNumber(props.plots[event.target.value]);
    setIndex(newIndex);
    setAmount(newAmount);
    setExpiresIn(newIndex.minus(harvestableIndex));
    setPricePerPodValue(new BigNumber(-1));
  };
  /** */
  const handlePriceChange = (event) => {
    let newPricePerPodValue = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);
    // CONSTRAINT: Price can't be created than 1
    if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
      newPricePerPodValue = new BigNumber(1);
    }
    setPricePerPodValue(newPricePerPodValue);
  };
  /** */
  const handlePodChange = (event) => {
    const newToPodValue = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);
    // CONSTRAINT: Amount can't be greater than size of selected plot.
    if (amountInSelectedPlot.lt(newToPodValue)) {
      setAmount(amountInSelectedPlot);
      return;
    }
    setAmount(newToPodValue);
  };
  /** */
  const handleExpireChange = (event) => {
    const newExpiresinValue = new BigNumber(event.target.value);
    // console.log('index', index.toNumber());
    // console.log('newExpiresinValue', newExpiresinValue.toNumber());
    // console.log('harvestableIndex', harvestableIndex.toNumber());

    // Price can't be created greater than 1
    if (
      index != null &&
      newExpiresinValue.isGreaterThanOrEqualTo(index.minus(harvestableIndex))
    ) {
      console.log(newExpiresinValue.toFixed());
      console.log(index.minus(harvestableIndex).toFixed());
      setExpiresIn(index.minus(harvestableIndex));
    } else {
      setExpiresIn(newExpiresinValue);
    }
  };

  /* Input Fields */
  const fromPlotField = (
    <PlotListInputField
      index={harvestableIndex}
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
      handleChange={handlePriceChange}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const amountField = (
    <TokenInputField
      label="Amount"
      token={FarmAsset.Pods}
      handleChange={handlePodChange}
      value={amount}
      maxHandler={() => {
        if (index != null) {
          setAmount(amountInSelectedPlot);
        }
      }}
    />
  );
  const expiresInField = (
    <PlotInputField
      label="Expires In"
      handleChange={handleExpireChange}
      value={TrimBN(expiresIn, 6)}
      maxHandler={() => {
        if (index != null) {
          setExpiresIn(index.minus(harvestableIndex));
        }
      }}
    />
  );

  /** 
   * If this plot is already listed, show the user a notification
   * that this action will update their prior listing.
   * 
   * FIXME: the below search is very slow and searches all listings instead of
   * filtering down to only my listings. We should store "myListings" separately in state
   * to narrow down the number of filter operations done here. I've implemented a quick-and-
   * dirty version of this locally within the component, but let's move it elsewhere.
   */
  let alreadyListedNotification;
  const [myListings, setMyListings] = useState<null | Listing[]>(null);
  useEffect(() => {
    (async () => {
      const walletAddress = await GetWalletAddress();
      setMyListings(
        allListings
          .filter((listing) => listing.listerAddress === walletAddress)
      );
    })();
  }, [allListings]);
  const existingListing = myListings ? myListings.find((listing) => listing.objectiveIndex.isEqualTo(index)) : null;
  if (existingListing) {
    alreadyListedNotification = (
      <div style={{
        border: '1px solid black' as const,
        borderRadius: '15px',
        color: 'black',
        fontSize: 'calc(11px + 0.5vmin)',
        padding: '12px',
        width: '100%',
      }}>
        {'You\'ve already listed this Plot on the Marketplace. Resubmitting this form will update the previous listing.'}
        <ListingsTable
          mode="MINE"
          enableControls={false}
          listings={[existingListing]}
          harvestableIndex={harvestableIndex}
        />
      </div>
    );
  }

  /** Details */
  const details = [
    `List ${displayBN(amount)} Pods from plot at position ${displayBN(selectedPlotPositionInLine)} in line for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod.`,
    `If fully sold, you will receive ${displayBN(amount.multipliedBy(pricePerPodValue))} Beans.`,
    `This listing will expire when ${displayBN(expiresIn)} additional Pods have been harvested. The total amount of pods harvested at this time will be ${displayBN(expiresIn.plus(harvestableIndex))}.`,
  ];

  function transactionDetails() {
    if (!props.readyToSubmit) return null;
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

  // FIXME:
  // This is required to allow resetting of the localized
  // form state from MarketplaceSellModule which creates this
  // component. For the sake of time I'm copying this design pattern
  // from BeanDepositModule and the rest of the website; however, we
  // need to redesign this system from scratch to avoid complicated prop-
  // passing and use of imperative handles. For example, instead of
  // having the form submission be handled by BaseModule, we should 
  // probably incorporate it directly into each form so that local state
  // can be managed appropriately. - Silo Chad
  useImperativeHandle(ref, () => ({
    resetForm() {
      setIndex(new BigNumber(-1));
      setAmount(new BigNumber(-1));
      setExpiresIn(new BigNumber(-1));
      setPricePerPodValue(new BigNumber(-1));
    },
  }));

  return (
    <>
      {fromPlotField}
      {index.gte(0) ? (
        <>
          {priceField}
          {amountField}
          {expiresInField}
          {alreadyListedNotification}
          {transactionDetails()}
        </>
      ) : null}
    </>
  );
});

export default CreateListingModule;
