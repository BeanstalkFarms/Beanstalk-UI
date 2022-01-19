import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { GetWalletAddress } from 'util/index';

import SellIntoOfferModal from 'components/Marketplace/Offers/SellIntoOfferModal';
import OffersTable from './OffersTable';
import { BuyOffer } from 'state/marketplace/reducer';
import { Box, Button, IconButton, Popover, Slider } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

import {
  FilterListRounded as FilterIcon,
} from '@material-ui/icons';

import { theme } from 'constants/index';

import { useStyles } from '../TableStyles';

type OffersProps = {
  mode: 'ALL' | 'MINE';
}

/**
 * Offers ("Offers to Buy")
 */
export default function Offers(props: OffersProps) {
  const classes = useStyles();

  const [walletAddress, setWalletAddress] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const { buyOffers: allOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );


  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );




  // Filter state
  const filteredOffers= useRef<BuyOffer[]>(allOffers);
  const [popoverEl, setPopoverEl] = React.useState<any>(null);
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

  //
  const openPopover = (event) => {
    setPopoverEl(event.currentTarget);
  };
  const handleClose = () => {
    setPopoverEl(null);
  };
  const open = Boolean(popoverEl);
  const id = open ? 'simple-popover' : undefined;

  const applyFilters = () => {
    handleClose();
    setPriceFilters(tempPriceFilters);
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
  if (filteredOffers.current.length === 0) {
    return <div>No listings.</div>;
  }

  // Filters
  const filters = (
    <>
      <Box style={{ position: 'relative' }}>
        <IconButton
          className={`${classes.filterButtonStyle} filterButton`}
          style={{
            color: 'white',
            backgroundColor: theme.iconButtonColor,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: '25px',
            padding: '6px',
            top: '20%',
          }}
          size="small"
          onClick={openPopover}
        >
          <FilterIcon />
        </IconButton>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={popoverEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        <Box sx={{
          top: '50%',
          left: '50%',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <h3>Price Per Pod</h3>
          <Slider
            value={tempPriceFilters}
            valueLabelDisplay="on"
            onChange={handlePriceFilter}
            step={0.01}
            min={0}
            max={1}
          />
          <h3>Place In Line</h3>
          <Slider
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
          <Button onClick={applyFilters}>Apply Filter</Button>
        </Box>
      </Popover>
    </>
  );



  if (allOffers == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (allOffers.length === 0) {
    return <div>No offers.</div>;
  }

  const offers = props.mode === 'MINE' ? (
    allOffers.filter((offer) => offer.listerAddress === walletAddress)
  ) : (
    allOffers.filter((offer) => offer.listerAddress !== walletAddress)
  );


  




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
