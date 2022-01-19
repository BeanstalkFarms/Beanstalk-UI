import React, { useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { BuyOffer } from 'state/marketplace/reducer';
import { GetWalletAddress } from 'util/index';
import { AppState } from 'state';

import SellIntoOfferModal from 'components/Marketplace/Offers/SellIntoOfferModal';
import OffersTable from './OffersTable';
import Filters, { StyledSlider } from '../Filters';

type OffersProps = {
  mode: 'ALL' | 'MINE';
}

/**
 * Offers ("Offers to Buy")
 */
export default function Offers(props: OffersProps) {
  const { buyOffers: allOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  //
  const [walletAddress, setWalletAddress] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);

  // Filter state
  const filteredOffers = useRef<BuyOffer[]>(allOffers);
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
    filteredOffers.current = _.filter(allOffers, (offer) => (
      (props.mode === 'MINE' ? (
        offer.listerAddress === walletAddress
      ) : (
        offer.listerAddress !== walletAddress
      )) &&
      offer.pricePerPod.toNumber() > priceFilters[0] &&
      offer.pricePerPod.toNumber() < priceFilters[1] &&
      offer.maxPlaceInLine
        .gte(new BigNumber(placeInLineFilters[0])) &&
        offer.maxPlaceInLine
        .lte(new BigNumber(placeInLineFilters[1]))
    ));

    return () => {
      // cleanup listings
    };
  }, [allOffers, priceFilters, placeInLineFilters, props.mode, walletAddress]);

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
      console.log('Buy Offers: init');
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (filteredOffers.current == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  // if (filteredOffers.current.length === 0) {
  //   return <div>No listings.</div>;
  // }

  // Filters
  const filters = (
    <Filters title={`Showing ${filteredOffers.current.length} offer${filteredOffers.current.length !== 1 ? 's' : ''}`}>
      <>
        <h3 style={{ marginTop: 0 }}>Price Per Pod</h3>
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
        <h3>Place In Line</h3>
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
      </>
    </Filters>
  );

  if (allOffers == null || walletAddress == null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SellIntoOfferModal
        currentOffer={currentOffer}
        onClose={() => setCurrentOffer(null)}
      />
      {filters}
      <OffersTable
        mode={props.mode}
        offers={filteredOffers.current}
        setCurrentOffer={setCurrentOffer}
      />
    </>
  );
}
