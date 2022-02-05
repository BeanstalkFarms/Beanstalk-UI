import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { PodListing } from 'state/marketplace/reducer';
import { BEAN } from 'constants/index';
import {
  MinBN,
  CryptoAsset,
  displayBN,
  FarmAsset,
  GetWalletAddress,
  createPodListing,
  toStringBaseUnitBN,
  TrimBN,
  MaxBN,
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
import PlotRangeInputField from 'components/Common/PlotRangeInputField';
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
  /** The selected Plot index. */
  const [start, setStart] = useState(new BigNumber(0));
  /** The amount of Pods listed from the plot. */
  const [totalAmount, setTotalAmount] = useState(new BigNumber(-1));
  /** How far forward the Pod Line needs to move before the order expire. */
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
      // console.log(`setListing`, {
      //   index, pricePerPodValue, totalAmount, expiresIn
      // });
      setListing({
        index,
        pricePerPod: pricePerPodValue,
        totalAmount,
        expiresIn,
      });
    } else {
      setListing(null);
    }
  }, [index, setListing, pricePerPodValue, totalAmount, expiresIn]);

  // function fromIndexValueUpdated(newStartNumber: BigNumber, newAmountNumber: BigNumber) {
  //   const newStartValue = MinBN(
  //     new BigNumber(newStartNumber),
  //     amountInSelectedPlot
  //   );
  //   const newAmountValue = MinBN(new BigNumber(newAmountNumber), totalAmount);
  //   setStart(TrimBN(newStartValue, BEAN.decimals));
  //   setTotalAmount(TrimBN(newAmountValue, BEAN.decimals));
  // }

  /** */
  const handlePlotChange = (event) => {
    const newIndex = new BigNumber(event.target.value);
    const newAmount = new BigNumber(props.plots[event.target.value]);
    // Select the plot
    setIndex(newIndex);
    // Set defaults
    setTotalAmount(TrimBN(newAmount, 6));           // Default: sell the whole plot
    setExpiresIn(newIndex.minus(harvestableIndex)); // Default: expire when the plot harvests
    setPricePerPodValue(new BigNumber(-1));         // Default: no price
    setStart(new BigNumber(0));                     // Default: sell entire plot, so start = 0
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
    const newAmount = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);

    // BACK-OF-PLOT LOGIC
    // If changing the `amount`, move `start` forward.
    // 
    // Example:
    //  start = 0, newToPodValue = 1000, totalAmount = 1900
    //  delta = -900
    //  start - delta = 0 - (-900) = 900.
    const delta = newAmount.minus(totalAmount);
    setStart(
      MaxBN(
        start.minus(delta),
        new BigNumber(0),
      )
    );

    // CONSTRAINT: Amount can't be greater than size of selected plot.
    if (amountInSelectedPlot.lt(newAmount)) {
      setTotalAmount(amountInSelectedPlot);
    } else {
      setTotalAmount(newAmount);
    }
  };
  // Handle start change
  // const handleStartChange = (event) => {
  //   if (event.target.value) {
  //     fromIndexValueUpdated(event.target.value, amountInSelectedPlot);
  //   } else {
  //     fromIndexValueUpdated(new BigNumber(0), amountInSelectedPlot);
  //   }
  // };

  /** */
  const handleExpireChange = (event) => {
    const newExpiresinValue = new BigNumber(event.target.value);
    // CONSTRAINT: Expiry can't be bigger than podline length
    if (
      index != null &&
      newExpiresinValue.isGreaterThanOrEqualTo(index.minus(harvestableIndex))
    ) {
      setExpiresIn(index.minus(harvestableIndex));
    } else {
      setExpiresIn(newExpiresinValue);
    }
  };

  const errorAmount = amountInSelectedPlot.minus(start).minus(totalAmount).isLessThan(0);

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
      description={marketStrings.pricePerPod}
      placeholder="0.50"
      token={CryptoAsset.Bean}
      handleChange={handlePriceChange}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const startField = (
    // The slice of the plot we're selling.
    // This can range from:
    //  MIN:   0
    //  START: start
    //  END:   start + totalAmount
    //  MAX:   amountInSelectedPlot
    <PlotRangeInputField
      label="Plot Range"
      description={marketStrings.plotRange}
      value={[
        TrimBN(start, 6),                   // `start` is held in state
        TrimBN(start.plus(totalAmount), 6)  // `end` is calculated depending on `start` and `totalAmount`.
      ]}
      range
      balance={amountInSelectedPlot}
      // `handleChange` is called for both the slider
      // and the inputs. keeps things standardized.
      handleChange={(event: BigNumber[]) => {
        // FIX: If someone manually types in a start
        // value that is greater than end value (or vice
        // versa), override and set amount = 0. This locks
        // end = start.
        if (event[0].gte(event[1])) {
          setStart(
            // CONSTRAINT: start > 0
            MaxBN(
              new BigNumber(0),
              event[0]
            )
          );
          setTotalAmount(
            new BigNumber(0),
          );
        } else {
          setStart(
            // CONSTRAINT: start > 0
            MaxBN(
              new BigNumber(0),
              event[0]
            )
          );
          setTotalAmount(
            // CONSTRAINT: totalAmount <= amountInSeletedPlot
            MinBN(
              amountInSelectedPlot,
              event[1].minus(event[0]),
            )
          );
        }
      }}
      // minHandler={minMaxHandler}
      error={errorAmount}
    />
  );
  const amountField = (
    <TokenInputField
      label="Amount"
      token={FarmAsset.Pods}
      handleChange={handlePodChange}
      value={TrimBN(totalAmount, 6)}
      maxHandler={() => {
        if (index != null) {
          // hack: use our existing logic but fake an event object
          handlePodChange({
            target: {
              value: amountInSelectedPlot
            }
          });
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
  const [myListings, setMyListings] = useState<null | PodListing[]>(null);
  useEffect(() => {
    (async () => {
      const walletAddress = await GetWalletAddress();
      setMyListings(
        allListings
          .filter((listing) => listing.account === walletAddress)
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
        {marketStrings.alreadyListed}
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
    `List ${displayBN(totalAmount)} Pods from Plot at position ${displayBN(selectedPlotPositionInLine)} in the Pod Line for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod.`,
    `This Pod Listing will expire when ${displayBN(expiresIn)} additional Pods have been Harvested so the total number of Pods Harvested is ${displayBN(expiresIn.plus(harvestableIndex))}.`,
    `If completely Filled, you will receive ${displayBN(totalAmount.multipliedBy(pricePerPodValue))} Beans. ${props.settings.toWallet ? marketStrings.toWallet : marketStrings.toWrapped}`,
  ];

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
        loading: `Listing ${displayBN(totalAmount)} Pods for ${TrimBN(pricePerPodValue, 6).toString()} Beans per Pod`,
        success: 'Listing placed',
      });

      // Execute
      createPodListing({
        index: toStringBaseUnitBN(index, BEAN.decimals),
        start: toStringBaseUnitBN(start, BEAN.decimals),
        amount: toStringBaseUnitBN(totalAmount, BEAN.decimals),
        pricePerPod: toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
        maxHarvestableIndex: toStringBaseUnitBN(expiresIn.plus(harvestableIndex), BEAN.decimals),
        toWallet: props.settings.toWallet,
      }, (response) => {
        // Reset inputs
        setIndex(new BigNumber(-1));
        setTotalAmount(new BigNumber(-1));
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
          <div style={{ height: 2 }} />
          {startField}
          {amountField}
          {priceField}
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
