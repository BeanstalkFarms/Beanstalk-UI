import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';

import { Listing } from 'state/marketplace/reducer';
import { CryptoAsset, GetWalletAddress } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { filterStrings, QuestionModule } from 'components/Common';

import BuyListingModal from './BuyListingModal';
import ListingsTable from './ListingsTable';
import Filters, { StyledSlider } from '../Filters';
import GraphModule from '../GraphModule';

type ListingsProps = {
  mode: 'ALL' | 'MINE';
}
/**
 * A Listing = an Offer to Sell.
 * A User can purchase the Pods in a Listing.
 */
export default function Listings(props: ListingsProps) {
  /** */
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  /** */
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const { listings: allListings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const filterTitleStyle = {
    display: 'inline',
    marginTop: 0,
    fontFamily: 'Futura-PT-Book',
    fontSize: '20.8px',
  };

  // Filter state
  const filteredListings = useRef<Listing[]>(allListings);
  const [priceFilters, setPriceFilters] = useState<number[]>([0, 1]);
  const [tempPriceFilters, setTempPriceFilters] = useState<number[]>([0, 1]);

  const placesInLine = [0, totalPods.toNumber()];
  const placesInLineBN = [0, new BigNumber(totalPods.toNumber())];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  // Handle changes in filters
  useMemo(() => {
    filteredListings.current = _.filter(allListings, (listing) => (
      (props.mode === 'MINE' ? (
        listing.listerAddress === walletAddress
      ) : (
        listing.listerAddress !== walletAddress
      )) &&
      listing.pricePerPod > priceFilters[0] &&
      listing.pricePerPod < priceFilters[1] &&
      listing.objectiveIndex
        .minus(harvestableIndex)
        .gte(new BigNumber(placeInLineFilters[0])) &&
      listing.objectiveIndex
        .minus(harvestableIndex)
        .lte(new BigNumber(placeInLineFilters[1])) &&
      listing.expiry
        .minus(harvestableIndex)
        .gte(new BigNumber(0))
    ));

    return () => {
      // cleanup listings
    };
  }, [allListings, priceFilters, placeInLineFilters, harvestableIndex, props.mode, walletAddress]);

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
      console.log('Listings: init');
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (filteredListings.current == null || walletAddress == null) {
    return <div>Loading...</div>;
  }

  // Filters
  const filters = (
    <Filters title={`${filteredListings.current.length} listing${filteredListings.current.length !== 1 ? 's' : ''}`}>
      <>
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
            valueLabelFormat={(value: number) => (
              <div style={{
                color: 'black',
                minWidth: 40, // prevent wrapping of bean onto newline
                textAlign: 'center',
                marginLeft: 10, // align vertically with placeInLine
              }}>
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
        {/* <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={applyFilters}>
          Apply Filter
        </Button> */}
      </>
    </Filters>
  );

  //
  return (
    <>
      <BuyListingModal
        currentListing={currentListing}
        setCurrentListing={setCurrentListing}
      />
      <Box>{filters}</Box>
      <ListingsTable
        mode={props.mode}
        listings={filteredListings.current}
        harvestableIndex={harvestableIndex}
        setCurrentListing={setCurrentListing}
      />
      {props.mode === 'ALL' && (
        <GraphModule
          setCurrentListing={setCurrentListing}
        />
      )}
    </>
  );
}
