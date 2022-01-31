import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
// import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Listing } from 'state/marketplace/reducer';
import { BEAN } from 'constants/index';
import {
  CryptoAsset,
  displayBN,
  FarmAsset,
  GetWalletAddress,
  createPodListing,
  toStringBaseUnitBN,
  TrimBN,
} from 'util/index';
import {
  PlotListInputField,
  TokenInputField,
  marketStrings,
  PlotInputField,
  SettingsFormModule,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';
import ListingsTable from './ListingsTable';

type CreateListingModuleProps = {
  // harvestableIndex: AppState['weather']['harvestableIndex'];
  plots: AppState['userBalance']['plots'];
  hasPlots: boolean;
  setListing: Function;
  readyToSubmit: boolean;
}

export const CreateListingModule = forwardRef((props: CreateListingModuleProps, ref) => {
  /** The absolute index of the selected plot in line. */
  const [index, setIndex] = useState(new BigNumber(-1));
  /** The amount of Pods listed from the plot. */
  const [amount, setAmount] = useState(new BigNumber(-1));
  /** How far forward the Pod line needs to move before the offer expire. */
  const [expiresIn, setExpiresIn] = useState(new BigNumber(-1));
  /** The price per pod. */
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { listings: allListings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

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
    setAmount(TrimBN(newAmount, 6));
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
      value={TrimBN(amount, 6)}
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
      description={marketStrings.expiresIn}
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
  const existingListing = myListings ? myListings.find((listing) => listing.index.isEqualTo(index)) : null;
  if (existingListing) {
    alreadyListedNotification = (
      <div style={{
        border: '1px solid black' as const,
        borderRadius: '15px',
        color: 'black',
        fontSize: 'calc(11px + 0.5vmin)',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
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

  if (props.settings.toWallet) {
    details.push(marketStrings.toWrapped);
  } else {
    details.push(marketStrings.toWallet);
  }

  function transactionDetails() {
    if (!props.readyToSubmit) return null;
    return (
      <TransactionDetailsModule fields={details} />
    );
  }

  // Users select how they want to receive their Beans from their listed Plots once purchased
  // FIXME:
  // Once new pod marketplace contract is updated we will need to send in this variable
  const showSettings = (
    <SettingsFormModule
      settings={props.settings}
      setSettings={props.setSettings}
      isCreateListing
      showUnitModule={false}
    />
  );

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
    // resetForm() {
    //   setIndex(new BigNumber(-1));
    //   setAmount(new BigNumber(-1));
    //   setExpiresIn(new BigNumber(-1));
    //   setPricePerPodValue(new BigNumber(-1));
    // },
    handleForm() {
      // Toast
      const txToast = new TransactionToast({
        loading: `Listing ${displayBN(amount)} Pods for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod`,
        success: 'Listing placed',
      });

      // Execute
      createPodListing({
        index: toStringBaseUnitBN(index, BEAN.decimals),
        start: '0', // FIXME: correct `start`
        amount: toStringBaseUnitBN(amount, BEAN.decimals),
        pricePerPod: toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
        maxHarvestableIndex: toStringBaseUnitBN(expiresIn.plus(harvestableIndex), BEAN.decimals),
        toWallet: false, // FIXME: correct `toWallet`
      }, (response) => {
        // Reset inputs
        setIndex(new BigNumber(-1));
        setAmount(new BigNumber(-1));
        setExpiresIn(new BigNumber(-1));
        setPricePerPodValue(new BigNumber(-1));
        setListing(null);
        txToast.confirming(response);
      })
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        txToast.error(err);
      });
    }
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
      {showSettings}
    </>
  );
});

export default CreateListingModule;
