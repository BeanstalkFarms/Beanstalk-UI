import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
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
import { beanstalkContract, GetWalletAddress, displayBN, toStringBaseUnitBN } from 'util/index';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { BalanceTableCell } from 'components/Common';
import { BuyListingModal } from './BuyListingModal';

import { useStyles } from './TableStyles';

function Listing({ listing, harvestableIndex, setListing, isMine }) {
  const classes = useStyles();
  return (
    <TableRow>
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Place in line"
        balance={listing.objectiveIndex.minus(harvestableIndex)}
      />
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Expiry"
        balance={(listing.expiry).minus(new BigNumber(harvestableIndex))}
      />
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Beans per pod"
        balance={listing.pricePerPod}
      />
      {isMine ? (
        <>
          <TableCell className={classes.lucidaStyle} align="right">
            {`${displayBN(listing.amountSold)} / ${displayBN(listing.initialAmount)}`}
            {listing.amountSold > 0 && <CircularProgress variant="determinate" value={(listing.amountSold.dividedBy(listing.initialAmount)).toNumber() * 100} />}
          </TableCell>
          <TableCell align="center">
            <IconButton
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelListing(
                  toStringBaseUnitBN(listing.objectiveIndex, BEAN.decimals)
                );
              }}
              style={{
                color: theme.linkColor,
               }}
              size="small"
            >
              <CancelIcon />
            </IconButton>
          </TableCell>
        </>
      ) : (
        <>
          <BalanceTableCell
            className={classes.lucidaStyle}
            balance={listing.initialAmount.minus(listing.amountSold)}
            label="Pods"
          />
          <TableCell align="center">
            <IconButton
              onClick={() => setListing(listing)}
              style={{ color: theme.linkColor }}
              size="small"
            >
              <ShoppingCartIcon />
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

export default function Listings() {
  const classes = useStyles();
  const [walletAddress, setWalletAddress] = useState(null);
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const myListings = listings.filter(
    (listing) => listing.listerAddress === walletAddress
  );
  const otherListings = listings.filter(
    (listing) => listing.listerAddress !== walletAddress
  );

  const marketplaceListings = useRef(otherListings);
  const [currentListing, setCurrentListing] = useState(null);
  const [popoverEl, setPopoverEl] = React.useState(null);

  const [priceFilters, setPriceFilters] = useState<number[]>([0, 1]);
  const [tempPriceFilters, setTempPriceFilters] = useState<number[]>([0, 1]);

  const placesInLine = [0, totalPods.toNumber()];
  const placesInLineBN = [
    0,
    new BigNumber(totalPods.toNumber()),
  ];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  useMemo(() => {
    marketplaceListings.current = _.filter(otherListings, (listing) => (
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
  }, [otherListings, priceFilters, placeInLineFilters, harvestableIndex]);

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

  useEffect(() => {
    const init = async () => {
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (listings == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (listings.length === 0) {
    return <div>No listings.</div>;
  }
  return (
    <>
      <BuyListingModal
        listing={currentListing}
        setCurrentListing={setCurrentListing}
      />
      {myListings.length > 0 && (
        <>
          <h2 className={classes.titleStyle}>Your Listings</h2>
          <TableContainer>
            <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Place in line</TableCell>
                  <TableCell align="right">Expiry</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Filled</TableCell>
                  <TableCell align="center">Cancel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myListings.map((listing) => (
                  <Listing
                    key={listing.objectiveIndex - harvestableIndex}
                    harvestableIndex={harvestableIndex}
                    listing={listing}
                    setListing={setCurrentListing}
                    isMine
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Box style={{ position: 'relative' }}>
        <h2 className={classes.titleStyle}>All Listings</h2>
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
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right">Place in line</TableCell>
              <TableCell align="right">Expiry</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Buy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketplaceListings.current.map((listing) => (
              <Listing
                key={listing.objectiveIndex - harvestableIndex}
                harvestableIndex={harvestableIndex}
                listing={listing}
                setListing={setCurrentListing}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
