import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { Box, Modal } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  CryptoAsset,
  displayBN,
  FarmAsset,
  fillPodOrder,
  MinBN,
  TrimBN,
  toStringBaseUnitBN,
  MaxBN,
} from 'util/index';
import { BEAN } from 'constants/index';
import { PodOrder } from 'state/marketplace/reducer';
import {
  BaseModule,
  PlotListInputField,
  // SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
  marketStrings,
} from 'components/Common';
import PlotRangeInputField from 'components/Common/PlotRangeInputField';

import { makeStyles } from '@mui/styles';
import OrdersTable from './OrdersTable';

const useStyles = makeStyles({
  modal: {
    maxHeight: '90vh'
  },
  height5: {
    height: 5
  },
  expandMoreIcon: {
    marginBottom: '-14px',
    width: '100%'
  }
});

type FillOrderModalProps = {
  currentOrder: PodOrder;
  onClose: Function;
  settings: any; // FIXME
  // setSettings: Function;
}

export default function FillOrderModal({
  currentOrder,
  onClose,
  settings,
}: FillOrderModalProps) {
  const classes = useStyles();
  /** The selected Plot index. */
  const [index, setIndex] = useState(new BigNumber(-1));
  /**  */
  const [start, setStart] = useState(new BigNumber(-1));
  /** The amount of Pods the User is willing to sell into this Order */
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

  // console.log(`index=${index}, amount=${amount}`)

  // Derived values
  const leftMargin = width < 800 ? 0 : 120;

  // When the modal re-renders for a new Order,
  // reset state.
  useEffect(() => {
    setIndex(new BigNumber(-1));
    setAmount(new BigNumber(0));
  }, [currentOrder]);

  // If no order selected, exit
  if (currentOrder == null) {
    return null;
  }

  // Filter my plots to show which ones I can sell
  const validPlotIndices = Object.keys(plots).filter((plotIndex) => {
    const plotObjectiveIndex = new BigNumber(plotIndex);
    return plotObjectiveIndex.minus(harvestableIndex).lt(currentOrder.maxPlaceInLine);
  });
  const validPlots = validPlotIndices.reduce((prev, curr) => (
    {
      ...prev,
      [curr]: plots[curr],
    }
  ), {});

  // Get the maximimum amount the user can sell.
  const getMaxAmountCanSell = (selectedPlotIndex: BigNumber) => (
    selectedPlotIndex.gt(0)
      ? BigNumber.minimum(
        // The total amount requested by the buyer
        currentOrder.remainingAmount,
        // The number of pods in this plot that we can sell into the order
        // Ex. User A creates a Buy order with relatiive index 100,000.
        //     I have a plot at index 99,900 with 200 plots in it.
        //     Only 100 of these are eligible to sell.
        (currentOrder.maxPlaceInLine).minus(selectedPlotIndex.minus(harvestableIndex)),
        // The total number of pods in the seller's plot.
        plots[selectedPlotIndex.toString()]
      )
      : new BigNumber(0)
  );

  // Get the maximum `end` value.
  const getMaxEnd = (selectedPlotIndex: BigNumber) => (
    // This plot begins at `selectedPlotIndex` and has `plots[selectedPlotIndex]` Pods in it.
    selectedPlotIndex.gt(0)
      ? MinBN(
        // The number of pods that are "eligible" for this order
        (currentOrder.maxPlaceInLine).minus(selectedPlotIndex.minus(harvestableIndex)),
        // The total number of pods in the seller's plot.
        plots[selectedPlotIndex.toString()],
      )
      : new BigNumber(0)
  );

  // Max amount that you can sell
  // currentOrder.maxPlaceInLine = the max place in line the buyer is willing to buy from
  // (i.e. can only sell if plot is before this)
  const maxAmountCanSell = getMaxAmountCanSell(index);
  const beansReceived = amount.times(currentOrder.pricePerPod);
  const amountInSelectedPlot = index ? new BigNumber(plots[index.toString()]) : new BigNumber(-1);
  // const end = start.plus(amount);
  const maxEnd = getMaxEnd(index);

  // function fromIndexValueUpdated(newStartNumber: BigNumber, newAmountNumber: BigNumber) {
  //   const newStartValue = MinBN(
  //     new BigNumber(newStartNumber),
  //     maxAmountCanSell
  //   );
  //   const newAmountValue = MinBN(new BigNumber(newAmountNumber), amount);
  //   setStart(TrimBN(newStartValue, BEAN.decimals));
  //   setAmount(TrimBN(newAmountValue, BEAN.decimals));
  // }

  // Handle plot change
  const handlePlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value === 'default') {
      setIndex(new BigNumber(-1));
      setAmount(new BigNumber(0));
      setStart(new BigNumber(0));
      return;
    }
    const newIndex = new BigNumber(event.target.value);
    const _maxAmount = getMaxAmountCanSell(newIndex);
    const _maxEnd = getMaxEnd(newIndex);
    console.log(`SellIntoOrderModal: handlePlotChange, newIndex=${newIndex}, maxAmountCanSell=${_maxAmount}`);
    
    // Defaults
    setIndex(newIndex);
    setAmount(_maxAmount);
    setStart(new BigNumber(_maxEnd).minus(_maxAmount));
  };

  // Handle Pod change
  const handlePodChange = (event) => {
    const newAmount = new BigNumber(event.target.value || 0);

    // BACK-OF-PLOT LOGIC
    // If changing the `amount`, move `start` forward.
    // 
    // Example:
    //  start = 0, newToPodValue = 1000, totalAmount = 1900
    //  delta = -900
    //  start - delta = 0 - (-900) = 900.
    const delta = newAmount.minus(amount);
    setStart(
      MaxBN(
        start.minus(delta),
        new BigNumber(0),
      )
    );

    // CONSTRAINT: New `amount` can't be greater than `maxAmountCanSell`.
    if (newAmount.isGreaterThanOrEqualTo(maxAmountCanSell)) {
      setAmount(maxAmountCanSell);
    } else {
      setAmount(newAmount);
    }
  };

  const minMaxHandler = () => {
    setStart(
      MaxBN(
        new BigNumber(0),
        // 0 < amount < maxAmountCanSell
        // We want to expand the plot range using the existing "end"
        // as a reference point. "end" is calculated as start.plus(amount).
        start.plus(amount).minus(maxAmountCanSell)
      )
    );
    setAmount(maxAmountCanSell);
  };
  // const errorAmount = maxAmountCanSell.minus(start).minus(amount).isLessThan(0);
  const errorAmount = amount.isGreaterThan(maxAmountCanSell);

  /* Input Fields */
  const amountField = (
    <TokenInputField
      key={2}
      label="Number of Pods to Sell"
      //
      locked={!index || index.lt(0)}
      token={FarmAsset.Pods}
      //
      value={TrimBN(amount, 6)}
      maxHandler={minMaxHandler}
      // balance={index.lt(0) ? null : maxAmountCanSell}
      //
      handleChange={handlePodChange}
      style={{ marginTop: 20 }}
    />
  );
  const plotRangeField = (
    // The slice of the plot we're selling.
    // This can range from:
    //  MIN:   0
    //  START: start
    //  END:   start + amount
    //  MAX:   amountInSelectedPlot
    <PlotRangeInputField
      disableSlider
      label="Plot Range"
      description={marketStrings.plotRange}
      value={[
        TrimBN(start, 6),                   // `start` is held in state
        TrimBN(start.plus(amount), 6)       // `end` is calculated depending on `start` and `amount`.
      ]}
      range
      balance={amountInSelectedPlot}
      // `handleChange` is called for both the slider
      // and the inputs. keeps things standardized.
      handleChange={(event: BigNumber[]) => {
        // Check if we're moving the "end" slider handle.
        // console.log(event[0].toNumber(), event[1].toNumber())

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
          setAmount(
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
          setAmount(
            // CONSTRAINT: amount <= maxAmountCanSell
            MinBN(
              maxAmountCanSell,
              event[1].minus(event[0]),
            )
          );
        }
      }}
      // minHandler={minMaxHandler}
      minHandler={() => {
        setStart(new BigNumber(0));
      }}
      maxHandler={() => {
        setStart(maxEnd.minus(amount));
      }}
      error={errorAmount}
    />
  );

  // Handle form submission
  // Sell some or all pods from a plot the user owns into an
  // existing buy order.
  const handleForm = async () => {
    // const plotKey = index.toString();
    // const plotToSellFrom = plots[plotKey];
    // Toast
    const txToast = new TransactionToast({
      loading: `Selling ${displayBN(amount)} Pods for ${displayBN(beansReceived)} Beans`,
      success: `Sold ${displayBN(amount)} Pods for ${displayBN(beansReceived)} Beans`,
    });

    // Contract Inputs
    const params = {
      order: {
        account: currentOrder.account,                                                  // address account
        pricePerPod: toStringBaseUnitBN(currentOrder.pricePerPod, BEAN.decimals),       // uint24 pricePerPod
        maxPlaceInLine: toStringBaseUnitBN(currentOrder.maxPlaceInLine, BEAN.decimals)  // uint256 maxPlaceInLine
      },
      index: toStringBaseUnitBN(index, BEAN.decimals),   // uint256 index
      start: toStringBaseUnitBN(start, BEAN.decimals),   // uint256 start
      amount: toStringBaseUnitBN(amount, BEAN.decimals), // uint256 amount
      toWallet: settings.toWallet,                       // uint24 toWallet
    };

    // Execute
    // console.log(index.toString(), plotToSellFrom.toString(), amount.toString(), start);
    // console.log(`Selling into a buy order from plot ${plotKey}; ${amount} of ${plotToSellFrom} pods`, params);
    fillPodOrder(
      params,
      (response) => {
        txToast.confirming(response);
      }
    )
    .then((value) => {
      txToast.success(value);
    })
    .catch((err) => {
      txToast.error(err);
    });
  };

  // Details
  const details : string[] = [];
  if (index && index.gt(0)) {
    details.push(`Sell ${displayBN(amount)} Pods out of ${displayBN(plots[index])} from your plot at place ${displayBN(index.minus(harvestableIndex))} in line.`);
    details.push(`Receive ${displayBN(beansReceived)} Beans.`);
    details.push('This sale will settle immediately.');
  }

  //
  const isDisabled = (
    index.lt(0)
    || !amount
    || amount.lte(0)
    || errorAmount
  );

  // Users select how they want to receive their Beans from their listed Plots once bought
  // FIXME:
  // Once new pod marketplace contract is updated we will need to send in this variable
  // const showSettings = (
  //   <SettingsFormModule
  //     settings={settings}
  //     setSettings={setSettings}
  //     isCreateListing
  //     showUnitModule={false}
  //   />
  // );

  return (
    <Modal
      open={currentOrder != null}
      onClose={onClose}
      className={classes.modal}
    >
      <BaseModule
        style={{
          position: 'absolute',
          top: '50%',
          marginTop: '5vh',
          width: '400px',
          left: '50%',
          marginLeft: `${leftMargin}px`,
          textAlign: 'center',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        section={0}
        sectionTitles={['Fill Order']}
        size="small"
        marginTop="0px"
        handleForm={handleForm}
        isDisabled={isDisabled}
      >
        {/**
          * Show the order we're selling into.
          */}
        <OrdersTable
          mode="ALL"
          orders={[currentOrder]}
          isSelling
        />
        <Box sx={{ marginTop: '20px' }}>
          {/**
            * Input fields.
            */}
          <PlotListInputField
            index={parseFloat(harvestableIndex)}
            items={validPlots}
            handleChange={handlePlotChange}
            label="Select plot"
            type="sell"
            descriptor="eligible"
          />
          {index.lt(0) ? null : (
            <>
              <div className={classes.height5} />
              {amountField}
              <div className={classes.height5} />
              {plotRangeField}
              {/**
                * Outputs + Details
                */}
              <ExpandMoreIcon
                color="primary"
                className={classes.expandMoreIcon}
              />
              <TokenOutputField
                title="Recieved Beans"
                mint
                token={CryptoAsset.Bean}
                value={beansReceived}
              />
              <TransactionDetailsModule fields={details} />
            </>
          )}
        </Box>
        {/* {showSettings} */}
      </BaseModule>
    </Modal>
  );
}
