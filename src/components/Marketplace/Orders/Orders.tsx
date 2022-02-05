import React, { useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { PodOrder } from 'state/marketplace/reducer';
import { GetWalletAddress } from 'util/index';
import { AppState } from 'state';
import { filterStrings, SwitchModule, QuestionModule } from 'components/Common';

import FillOrderModal from 'components/Marketplace/Orders/FillOrderModal';
import OrdersTable from './OrdersTable';
import Filters, { StyledSlider } from '../Filters';

type OrdersProps = {
  mode: 'ALL' | 'MINE';
  currentOrder: PodOrder | null;
  setCurrentOrder: Function;
};

/**
 * Orders
 */
export default function Orders(props: OrdersProps) {
  const { orders: allOrders } = useSelector<
    AppState,
    AppState['marketplace']
  >((state) => state.marketplace);
  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { plots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const filterTitleStyle = {
    display: 'inline',
    marginTop: 0,
    fontFamily: 'Futura-PT-Book',
    fontSize: '20.8px',
  };

  //
  const [walletAddress, setWalletAddress] = useState(null);

  //
  const [settings, setSettings] = useState({
    toWallet: false,
  });

  // Filter state
  const filteredOrders = useRef<PodOrder[]>(allOrders);
  const [priceFilters, setPriceFilters] = useState<number[]>([0, 1]);
  const [tempPriceFilters, setTempPriceFilters] = useState<number[]>([0, 1]);
  /** */
  const [validOrders, setValidOrders] = useState<boolean>(false);

  const placesInLine = [0, totalPods.toNumber()];
  const placesInLineBN = [0, new BigNumber(totalPods.toNumber())];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  // Handle changes in filters
  useMemo(() => {
    filteredOrders.current = _.filter(
      allOrders,
      (order) =>
        (props.mode === 'MINE'
          ? order.account === walletAddress
          : order.account !== walletAddress) &&
        order.pricePerPod.toNumber() > priceFilters[0] &&
        order.pricePerPod.toNumber() < priceFilters[1] &&
        order.maxPlaceInLine.gte(new BigNumber(placeInLineFilters[0])) &&
        order.maxPlaceInLine.lte(new BigNumber(placeInLineFilters[1]))
    );

    // Filter Orders the user cannot sell a plot into
    filteredOrders.current = _.filter(filteredOrders.current, (order) => {
      let validPlots = [];
      if (validOrders) {
        const validPlotIndices = Object.keys(plots).filter((plotIndex) => {
          const plotObjectiveIndex = new BigNumber(plotIndex);
          return plotObjectiveIndex
            .minus(harvestableIndex)
            .lt(order.maxPlaceInLine);
        });
        validPlots = validPlotIndices.reduce(
          (prev, curr) => ({
            ...prev,
            [curr]: plots[curr],
          }),
          {}
        );
      }
      return Object.keys(validPlots).length > 0 === validOrders || !validOrders;
    });

    return () => {
      // cleanup listings
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allOrders,
    priceFilters,
    placeInLineFilters,
    props.mode,
    walletAddress,
    validOrders,
  ]);

  //
  const handlePriceFilter = (event, newValue) => {
    setTempPriceFilters(newValue);
    setPriceFilters(newValue);
  };
  const handlePlaceInLineFilter = (event, newValue) => {
    setTempPlaceInLineFilters(newValue);
    setPlaceInLineFilters([
      new BigNumber(tempPlaceInLineFilters[0]),
      new BigNumber(tempPlaceInLineFilters[1]),
    ]);
  };

  // Setup
  useEffect(() => {
    const init = async () => {
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (filteredOrders.current == null || walletAddress == null) {
    return <div>Loading...</div>;
  }

  // Filters
  const filters = (
    <Filters
      title={`${filteredOrders.current.length} Order${filteredOrders.current.length !== 1 ? 's' : ''}`}
    >
      {/* Toggle for users to select to filter out plots they can't sell into  */}
      {props.mode !== 'MINE' && (
        <>
          <Box sx={{ mt: 3, px: 0.75 }} style={filterTitleStyle}>
            Orders you can Sell to
            <QuestionModule
              description={filterStrings.toggleValidOrders}
              margin="-10px 0px 0px 0px"
              placement="right"
            />
          </Box>
          <Box sx={{ mt: 3, px: 0.75 }} style={{ margin: '10px 0' }}>
            <SwitchModule
              setValue={(value) => {
                setValidOrders(value);
              }}
              value={validOrders}
            />
          </Box>
        </>
      )}
      {/* Price per Pod sliding filter  */}
      <Box sx={{ mt: 3, px: 0.75 }} style={filterTitleStyle}>
        Price Per Pod
        <QuestionModule
          description={filterStrings.pricePerPod}
          margin="-12px 0px 0px 2px"
          placement="right"
        />
      </Box>
      <Box sx={{ mt: 3, px: 0.75 }}>
        <StyledSlider
          value={tempPriceFilters}
          valueLabelDisplay="on"
          onChange={handlePriceFilter}
          step={0.01}
          min={0}
          max={1}
        />
      </Box>
      {/* Place in Line sliding filter  */}
      <Box sx={{ mt: 3, px: 0.75 }} style={filterTitleStyle}>
        Place In Line
        <QuestionModule
          description={filterStrings.placeInLine}
          margin="-10px 0px 0px 0px"
          placement="right"
        />
      </Box>
      <Box sx={{ mt: 3, px: 0.75 }}>
        <StyledSlider
          value={tempPlaceInLineFilters}
          valueLabelFormat={(value: number) => {
            const units = ['', 'K', 'M', 'B'];
            let unitIndex = 0;
            let scaledValue = value;
            while (scaledValue >= 1000 && unitIndex < units.length - 1) {
              unitIndex += 1;
              scaledValue /= 1000;
            }
            return `${Math.trunc(scaledValue)}${units[unitIndex]}`;
          }}
          valueLabelDisplay="on"
          onChange={handlePlaceInLineFilter}
          min={0}
          max={totalPods.toNumber()}
        />
      </Box>
      {/* <Button onClick={applyFilters}>Apply Filter</Button> */}
    </Filters>
  );

  if (allOrders == null || walletAddress == null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <FillOrderModal
        currentOrder={props.currentOrder}
        onClose={() => props.setCurrentOrder(null)}
        settings={settings}
        setSettings={setSettings}
      />
      {filters}
      <OrdersTable
        mode={props.mode}
        orders={filteredOrders.current}
        seCurrentOrder={props.setCurrentOrder}
        validOrders={validOrders}
      />
    </>
  );
}
