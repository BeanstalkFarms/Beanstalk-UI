import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  Popover,
  Typography,
  Slider,
  CircularProgress
} from '@material-ui/core';
import { beanstalkContract, GetWalletAddress } from 'util/index';
import _ from 'lodash';
import BigNumber from 'bignumber.js';

function Listing({ listing, harvestableIndex, setListing, isMine }) {
  return (
    <TableRow>
      <TableCell align="center">
        {/* TODO STYLE TO NORMALIZE  */}
        {((listing.objectiveIndex.div(10 ** 6)).minus(new BigNumber(harvestableIndex))).toString()}
      </TableCell>
      <TableCell align="center">
        {/* TODO STYLE TO NORMALIZE  */}
        {((listing.expiry.div(10 ** 6)).minus(new BigNumber(harvestableIndex))).toString()}
      </TableCell>
      <TableCell align="center">
        {listing.pricePerPod.div(10 ** 6).toString()}
      </TableCell>
      {isMine ? (
        <>
          <TableCell align="center">
            {`${listing.amountSold.div(10 ** 6).toString()} / ${listing.initialAmount.div(10 ** 6).toString()}`}
            <CircularProgress variant="determinate" value={(listing.amountSold.div(10 ** 6).dividedBy(listing.initialAmount.div(10 ** 6))).toNumber() * 100} />


          </TableCell>
          <TableCell align="center">
            {listing.amountSold.div(10 ** 6).toString()}
          </TableCell>
          <TableCell align="center">
            <Button
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelListing(
                  listing.objectiveIndex.toString()
                );
              }}
            >
              Cancel
            </Button>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell align="center">
            {listing.initialAmount
              .minus(listing.amountSold)
              .div(10 ** 6)
              .toString()}
          </TableCell>
          <TableCell align="center">
            <Button onClick={() => setListing(listing)}>Buy</Button>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

export default function Listings() {
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
    new BigNumber(totalPods.toNumber()).multipliedBy(10 ** 6),
  ];

  const [placeInLineFilters, setPlaceInLineFilters] =
    useState<BigNumber[]>(placesInLineBN);

  const [tempPlaceInLineFilters, setTempPlaceInLineFilters] =
    useState<number[]>(placesInLine);

  useMemo(() => {
    marketplaceListings.current = _.filter(otherListings, (listing) => (
        listing.pricePerPod > priceFilters[0] * 1000000 &&
        listing.pricePerPod < priceFilters[1] * 1000000 &&
        listing.objectiveIndex
          .minus(harvestableIndex.multipliedBy(10 ** 6))
          .gt(new BigNumber(placeInLineFilters[0])) &&
        listing.objectiveIndex
          .minus(harvestableIndex.multipliedBy(10 ** 6))
          .lt(new BigNumber(placeInLineFilters[1]))
      ));

    return () => {
      // cleanup listings
    };
  }, [otherListings, priceFilters, placeInLineFilters, harvestableIndex]);

  const handlePriceFilter = (event, newValue) => {
    setTempPriceFilters(newValue);
  };
  const handlePlaceInLineFilter = (event, newValue) => {
    console.log('handlePlaceInLineFilter', 'newValue', newValue);
    setTempPlaceInLineFilters(newValue);
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
      new BigNumber(tempPlaceInLineFilters[0]).multipliedBy(10 ** 6),
      new BigNumber(tempPlaceInLineFilters[1]).multipliedBy(10 ** 6),
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
  const buy = () => {
    console.log('buy listing');
  };
  console.log('listings:', listings);

  return (
    <>
      <Modal
        open={currentListing != null}
        onClose={() => setCurrentListing(null)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* TODO: need to make this a better input (like swap inputs, be able to use beans / eth / max out, etc) */}
          <h2>Buy this plot</h2>
          <p style={{ width: '100%', wordBreak: 'break-all' }}>
            {JSON.stringify(currentListing)}
          </p>
          <Button onPress={buy}>Buy</Button>
        </Box>
      </Modal>
      {myListings.length > 0 && (
        <>
          <h2 style={{ marginLeft: 12 }}>Your Listings</h2>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Place in line</TableCell>
                  <TableCell align="center">Expires In</TableCell>
                  <TableCell align="center">Price per pod</TableCell>
                  <TableCell align="center">Amount Filled</TableCell>
                  <TableCell align="center" />
                </TableRow>
              </TableHead>
              {myListings.map((listing) => (
                <Listing
                  key={listing.objectiveIndex - harvestableIndex}
                  harvestableIndex={harvestableIndex}
                  listing={listing}
                  setListing={setCurrentListing}
                  isMine
                />
              ))}
            </Table>
          </TableContainer>
        </>
      )}
      <h2 style={{ marginLeft: 12 }}>All Listings</h2>
      <Box
        sx={{
            justifyContent: 'center',
            alignItems: 'center',
            p: '4',
          }}
        >
        <Button
          aria-describedby={id}
          variant="contained"
          onClick={openPopover}
          >
          Filter
        </Button>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={popoverEl}
        onClose={handleClose}
        anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
        <Box
          sx={{
                top: '50%',
                left: '50%',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}
            >
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Place in line</TableCell>
              <TableCell align="center">Expires In</TableCell>
              <TableCell align="center">Price per pod</TableCell>
              <TableCell align="center">Amount</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          {marketplaceListings.current.map((listing) => (
            <Listing
              key={listing.objectiveIndex - harvestableIndex}
              harvestableIndex={harvestableIndex}
              listing={listing}
              setListing={setCurrentListing}
            />
          ))}
        </Table>
      </TableContainer>
    </>
  );
}
