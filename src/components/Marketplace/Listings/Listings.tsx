import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import filter from 'lodash/filter';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { AppState } from 'state';
import { PodListing } from 'state/marketplace/reducer';
import { account, CryptoAsset, displayBN, FarmAsset } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { filterStrings, QuestionModule } from 'components/Common';

import { zeroBN } from 'constants/index';
import FillListingModal from './FillListingModal';
import ListingsTable from './ListingsTable';
import Filters, { StyledSlider } from '../Filters';

const useStyles = makeStyles({
  filterTitleStyle: {
    display: 'inline',
    marginTop: 0,
    fontFamily: 'Futura-PT-Book',
    fontSize: '20.8px',
  },
  divStyle: {
    color: 'black',
    minWidth: 40, // prevent wrapping of bean onto newline
    textAlign: 'center',
    marginLeft: 10, // align vertically with placeInLine
  }
});

type ListingsProps = {
  mode: 'ALL' | 'MINE';
  currentListing: PodListing | null;
  setCurrentListing: Function;
}

/**
 * A Listing = an Order to Sell.
 * A User can purchase the Pods in a Listing.
 */
export default function Listings(props: ListingsProps) {
  const classes = useStyles();

  const { listings: allListings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Filter state
  const filteredListings = useRef<PodListing[]>(allListings);
  const [priceFilters, setPriceFilters] = useState<number[]>([0, 1]);
  const [tempPriceFilters, setTempPriceFilters] = useState<number[]>([0, 1]);

  const placesInLine   = [0, totalPods.toNumber()];
  const placesInLineBN = [zeroBN, totalPods];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  // Handle changes in filters
  // FIXME: This will not rerender if `account` changes because it
  // it outside of React's scope.
  useMemo(() => {
    if (props.mode === 'MINE') {
      filteredListings.current = filter(allListings, (listing) => (
        listing.account === account
      ));
    } else {
      filteredListings.current = filter(allListings, (listing) => (
        listing.account !== account &&
        listing.pricePerPod.toNumber() >= priceFilters[0] &&
        listing.pricePerPod.toNumber() <= priceFilters[1] &&
        listing.index
          .minus(harvestableIndex)
          .gte(new BigNumber(placeInLineFilters[0])) &&
        // FIXME: pre-calculate expiry when data is loaded
        // This is mega inefficient.
        listing.index
          .minus(harvestableIndex)
          .lte(new BigNumber(placeInLineFilters[1])) &&
        listing.maxHarvestableIndex
          .minus(harvestableIndex)
          .gte(zeroBN)
      ));
    }

    return () => {
      // cleanup listings
    };
  }, [allListings, priceFilters, placeInLineFilters, harvestableIndex, props.mode]);

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

  if (filteredListings.current == null || account == null) {
    return <div>Loading...</div>;
  }

  const numPods = filteredListings.current.reduce(
    (sum, curr) => sum.plus(curr.remainingAmount),
    zeroBN
  );

  // Filters
  const filters = (
    <Filters title={
      <>
        {filteredListings.current.length} Listing{filteredListings.current.length !== 1 ? 's' : ''} &middot; {displayBN(numPods)}<TokenIcon token={FarmAsset.Pods} />
      </>
    }>
      <>
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
            valueLabelFormat={(value: number) => (
              <div className={classes.divStyle}>
                {value}<TokenIcon token={CryptoAsset.Bean} />
              </div>
            )}
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
            valueLabelDisplay="on"
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
            onChange={handlePlaceInLineFilter}
            min={0}
            max={totalPods.toNumber()}
          />
        </Box>
      </>
    </Filters>
  );

  //
  return (
    <>
      <FillListingModal
        currentListing={props.currentListing}
        setCurrentListing={props.setCurrentListing}
      />
      <Box>{filters}</Box>
      <ListingsTable
        mode={props.mode}
        listings={filteredListings.current}
        harvestableIndex={harvestableIndex}
        setCurrentListing={props.setCurrentListing}
      />
    </>
  );
}
