import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  FilterListRounded as FilterIcon,
} from '@material-ui/icons';
import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Popover,
  Slider,
  CircularProgress,
} from '@material-ui/core';

import { theme, BEAN } from 'constants/index';
import { beanstalkContract, GetWalletAddress, displayBN, toStringBaseUnitBN, FarmAsset, CryptoAsset } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule } from 'components/Common';
import { BuyListingModal } from './BuyListingModal';
import { useStyles } from '../TableStyles';
import { Listing } from 'state/marketplace/reducer';
import ListingsTable from './ListingsTable';

type ListingsProps = {
  mode: 'ALL' | 'MINE';
}

/**
 * A Listing = an Offer to Sell.
 * A User can purchase the Pods in a Listing.
 */
export default function Listings(props: ListingsProps) {
  const classes = useStyles();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { listings: allListings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Pick listings from state depending on props.mode
  // const listings = props.mode === 'MINE' ? (
  //   allListings.filter(
  //     (listing) => listing.listerAddress === walletAddress
  //   )
  // ) : (
  //   allListings.filter(
  //     (listing) => listing.listerAddress !== walletAddress
  //   )
  // )

  // Filter state
  const filteredListings = useRef<Listing[]>(allListings);
  const [currentListing, setCurrentListing] = useState<null | Listing>(null);
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
    filteredListings.current = _.filter(allListings, (listing) => (
      props.mode === 'MINE' ? (
        listing.listerAddress === walletAddress
      ) : (
        listing.listerAddress !== walletAddress
      ) &&
      listing.pricePerPod > priceFilters[0] &&
      listing.pricePerPod < priceFilters[1] &&
      listing.objectiveIndex
        .minus(harvestableIndex)
        .gt(new BigNumber(placeInLineFilters[0])) &&
      listing.objectiveIndex
        .minus(harvestableIndex)
        .lt(new BigNumber(placeInLineFilters[1])) &&
      listing.expiry
        .minus(harvestableIndex)
        .gt(new BigNumber(0))
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
      console.log(`Listings: init`)
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  console.log(`filteredListings`, filteredListings)

  if (filteredListings.current == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (filteredListings.current.length === 0) {
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
  )

  //
  return (
    <>
      <BuyListingModal
        listing={currentListing}
        setCurrentListing={setCurrentListing}
      />
      {filters}
      <ListingsTable
        mode={props.mode}
        listings={filteredListings.current}
        harvestableIndex={harvestableIndex}
        setCurrentListing={setCurrentListing}
      />
    </>
  );
}
