import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  Box,
  Modal,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {
  CryptoAsset,
  displayBN,
  FarmAsset,
  fillPodOrder,
  MinBN,
  TrimBN,
  toStringBaseUnitBN,
} from 'util/index';
import { BEAN } from 'constants/index';
import {
  BaseModule,
  PlotInputField,
  PlotListInputField,
  SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';
import { PodOrder } from 'state/marketplace/reducer';
import OrdersTable from './OrdersTable';

type FillOrderModalProps = {
  currentOrder: PodOrder;
  onClose: Function;
  settings: any; // FIXME
  setSettings: Function;
}

export default function FillOrderModal({
  currentOrder,
  onClose,
  settings,
  setSettings
}: FillOrderModalProps) {
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
        (currentOrder.maxPlaceInLine).minus(plots[selectedPlotIndex]),
        // The total number of pods in the seller's plot.
        plots[selectedPlotIndex]
      )
      : new BigNumber(0)
  );

  // Max amount that you can sell
  // currentOrder.maxPlaceInLine = the max place in line the buyer is willing to buy from
  // (i.e. can only sell if plot is before this)
  const maxAmountCanSell = getMaxAmountCanSell(index);
  const beansReceived = amount.times(currentOrder.pricePerPod);

  function fromIndexValueUpdated(newStartNumber: BigNumber, newAmountNumber: BigNumber) {
    const newStartValue = MinBN(
      new BigNumber(newStartNumber),
      maxAmountCanSell
    );
    const newAmountValue = MinBN(new BigNumber(newAmountNumber), amount);
    setStart(TrimBN(newStartValue, BEAN.decimals));
    setAmount(TrimBN(newAmountValue, BEAN.decimals));
  }

  // Handle plot change
  const handlePlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value === 'default') {
      setIndex(new BigNumber(-1));
      setAmount(new BigNumber(0));
      setStart(new BigNumber(0));
      return;
    }
    const newIndex = new BigNumber(event.target.value);
    const _max = getMaxAmountCanSell(newIndex);
    console.log(`SellIntoorderModal: handlePlotChange, newIndex=${newIndex}, maxAmountCanSell=${_max}`);
    setIndex(newIndex);
    setAmount(_max);
    setStart(new BigNumber(0));
  };
  // Handle Pod change
  const handlePodChange = (event) => {
    const newAmount = new BigNumber(event.target.value || 0);
    if (newAmount.isGreaterThanOrEqualTo(maxAmountCanSell)) {
      setAmount(maxAmountCanSell);
      return;
    }
    setAmount(newAmount);
  };
  // Handle start change
  const handleStartChange = (event) => {
    if (event.target.value) {
      fromIndexValueUpdated(event.target.value, maxAmountCanSell);
    } else {
      fromIndexValueUpdated(new BigNumber(0), maxAmountCanSell);
    }
  };

  const minMaxHandler = () => {
    setAmount(maxAmountCanSell);
    setStart(new BigNumber(0));
  };
  const errorAmount = maxAmountCanSell.minus(start).minus(amount).isLessThan(0);

  /* Input Fields */
  const plotField = (
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
  const startField = (
    <PlotInputField
      key={0}
      // hidden={props.isFormDisabled && !start.isEqualTo(toPlotEndIndex)}
      // balance={plotEndId}
      handleChange={handleStartChange}
      label="Start Index"
      value={TrimBN(start, 6)}
      minHandler={minMaxHandler}
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

  // Users select how they want to receive their Beans from their listed Plots once purchased
  // FIXME:
  // Once new pod marketplace contract is updated we will need to send in this variable
  const showSettings = (
    <SettingsFormModule
      settings={settings}
      setSettings={setSettings}
      isCreateListing
      showUnitModule={false}
    />
  );

  return (
    <Modal
      open={currentOrder != null}
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
        sectionTitles={['Sell Pods']}
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
        />
        <Box sx={{ marginTop: 20 }}>
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
              <div style={{ height: 5 }} />
              {startField}
              {plotField}
              {/**
                * Outputs + Details
                */}
              <ExpandMoreIcon
                color="primary"
                style={{ marginBottom: '-14px', width: '100%' }}
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
        {showSettings}
      </BaseModule>
    </Modal>
  );
}
