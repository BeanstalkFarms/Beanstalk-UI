import React, { useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import filter from 'lodash/filter';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import { account, displayBN, FarmAsset } from 'util/index';
import { PodOrder } from 'state/marketplace/reducer';
import { AppState } from 'state';
import { filterStrings, SwitchModule, QuestionModule } from 'components/Common';
import TokenIcon from 'components/Common/TokenIcon';
import FillOrderModal from 'components/Marketplace/Orders/FillOrderModal';

import { makeStyles } from '@mui/styles';
import OrdersTable from './OrdersTable';
import Filters, { StyledSlider } from '../Filters';

const useStyles = makeStyles({
  filterTitleStyle: {
    display: 'inline',
    marginTop: 0,
    fontFamily: 'Futura-PT-Book',
    fontSize: '20.8px',
  },
  validOrders: {
    margin: '10px 0'
  }
});

type OrdersProps = {
  mode: 'ALL' | 'MINE';
  currentOrder: PodOrder | null;
  setCurrentOrder: Function;
};

/**
 * Orders
 */
export default function Orders(props: OrdersProps) {
  const classes = useStyles();
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

  //
  // const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [settings, setSettings] = useState({ toWallet: false, });
  const filteredOrders = useRef<PodOrder[]>(allOrders);
  const [priceFilters, setPriceFilters] = useState<number[]>([0, 1]);
  const [tempPriceFilters, setTempPriceFilters] = useState<number[]>([0, 1]);
  const [validOrders, setValidOrders] = useState<boolean>(false);

  const maxOrderMaxPlaceInLine =  useMemo(() => 
    Math.max(...allOrders.map((o) => o.maxPlaceInLine.toNumber())), [allOrders]);

  const placesInLine = [0, maxOrderMaxPlaceInLine];
  const placesInLineBN = [0, new BigNumber(maxOrderMaxPlaceInLine)];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  // Handle changes in filters
  // FIXME: this is super inefficient
  useMemo(() => {
    if (props.mode === 'MINE') {
      filteredOrders.current = filter(
        allOrders,
        (order) => 
          order.account.toLowerCase() === account
      );
    } else {
      const endFilterIsMaxed = placeInLineFilters[1].gte(totalPods);
      filteredOrders.current = filter(
        allOrders,
        (order) => 
          order.account.toLowerCase() !== account &&
          order.pricePerPod.toNumber() >= priceFilters[0] &&
          order.pricePerPod.toNumber() <= priceFilters[1] &&
          order.maxPlaceInLine.gte(placeInLineFilters[0]) && 
          // Bugfix: some market listings have their maxPlaceInLine
          // bumped up slightly. Probably a rounding error when creating
          // the order. If the end filter is maxed (equal to the total
          // number of pods) we ignore the filter entirely.
          // [Marketplace/Orders]
          //    end filter                  = 682,224,755.387
          //    first order maxPlaceInLine  = 682,224,755.391
          //    totalPods                   = 682,224,755.387
          (endFilterIsMaxed 
            ? true
            : order.maxPlaceInLine.lte(placeInLineFilters[1])
          )
      );
    }

    console.debug(`[Marketplace/Orders] Filtering ${allOrders.length} Orders (mode = ${props.mode}, account = ${account})`);
    console.debug('[Marketplace/Orders] priceFilters = ', priceFilters);
    console.debug('[Marketplace/Orders] placeInLineFilters = ', placeInLineFilters);
    console.debug(`[Marketplace/Orders] filteredOrders (${filteredOrders.current.length}) = `, filteredOrders.current);
    console.debug(`[Marketplace/Orders] end filter = ${placeInLineFilters[1].toNumber().toLocaleString()}, first order maxPlaceInLine = ${filteredOrders.current[0] ? filteredOrders.current[0].maxPlaceInLine.toNumber().toLocaleString() : null}, totalPods = ${totalPods.toNumber().toLocaleString()}`);

    // Filter Orders the user cannot sell a plot into
    filteredOrders.current = filter(filteredOrders.current, (order) => {
      let validPlots : any[] = [];
      if (validOrders) {
        // Find plot indices that are eligible to be sold to this Order.
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
    account,
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

  // // Setup
  // useEffect(() => {
  //   const init = async () => {
  //     const addr = await getWalletAddress();
  //     setWalletAddress(addr ? addr.toLowerCase() : null);
  //   };
  //   init();
  // }, []);

  if (filteredOrders.current == null || account == null) {
    return <div>Loading...</div>;
  }

  // const numPods = sum(filteredOrders.current.map((order: PodOrder) => order.totalAmount.toNumber()));
  const numPods = filteredOrders.current.reduce(
    (sum, curr) => sum.plus(curr.remainingAmount),
    new BigNumber(0)
  );

  // Filters
  const filters = (
    <Filters
      title={(
        <>
          {filteredOrders.current.length} Order{filteredOrders.current.length !== 1 ? 's' : ''} &middot; {displayBN(numPods)}<TokenIcon token={FarmAsset.Pods} />
        </>
      )}
    >
      {/* Toggle for users to select to filter out plots they can't sell into  */}
      {props.mode !== 'MINE' && (
        <>
          <Box sx={{ mt: 3, px: 0.75 }} className={classes.filterTitleStyle}>
            Orders you can Sell to
            <QuestionModule
              description={filterStrings.toggleValidOrders}
              margin="-10px 0px 0px 0px"
              placement="right"
            />
          </Box>
          <Box sx={{ mt: 3, px: 0.75 }} className={classes.validOrders}>
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
      <Box sx={{ mt: 3, px: 0.75 }} className={classes.filterTitleStyle}>
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
      <Box sx={{ mt: 3, px: 0.75 }} className={classes.filterTitleStyle}>
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
          max={maxOrderMaxPlaceInLine}
        />
      </Box>
    </Filters>
  );

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
