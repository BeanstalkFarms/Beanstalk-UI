import React, { useEffect, useState } from 'react';
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
  Slider
} from '@material-ui/core';
import { GetWalletAddress } from 'util/index';

function Listing({ listing, setListing, isMine }) {
  return (
    <TableRow>
      <TableCell align="center">
        {listing.objectiveIndex.div(10 ** 6).toString()}
      </TableCell>
      <TableCell align="center">
        {listing.pricePerPod.div(10 ** 6).toString()}
      </TableCell>
      { isMine ? (
        <>
          <TableCell align="center">
            {listing.initialAmount.div(10 ** 6).toString()}
          </TableCell>
          <TableCell align="center">
            {listing.amountSold.div(10 ** 6).toString()}
          </TableCell>
          <TableCell align="center">
            <Button
              onClick={() => console.log('cancel')}
            >
              Cancel
            </Button>
          </TableCell>
        </>

      ) : (
        <>
          <TableCell align="center">
            {listing.initialAmount.minus(listing.amountSold).div(10 ** 6).toString()}
          </TableCell>
          <TableCell align="center">
            <Button
              onClick={() => setListing(listing)}
            >
              Buy
            </Button>
          </TableCell>
        </>
      ) }
    </TableRow>
  );
}

export default function Listings() {
  const [walletAddress, setWalletAddress] = useState(null);
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const [currentListing, setCurrentListing] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);


const [priceFilters, setPriceFilters] = useState<number[]>([0, 999999]);

const [priceSliderText, setPriceSliderText] = useState<string>("");


  const handlePriceFilter = (event, newPriceFilters) => {
    setPriceFilters(newPriceFilters);
  };

  const openPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const applyFilters = () => {
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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
  const myListings = listings.filter((listing) => listing.listerAddress === walletAddress);
  const otherListings = listings.filter((listing) => listing.listerAddress !== walletAddress);

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
          <p style={{ width: '100%', wordBreak: 'break-all' }}>{JSON.stringify(currentListing)}</p>
          <Button onPress={buy}>
            Buy
          </Button>
        </Box>
      </Modal>
      {myListings.length > 0 && (
        <>
          <h2 style={{ marginLeft: 12 }}>Your Listings</h2>
          <Button aria-describedby={id} variant="contained" onClick={openPopover}>
            Filter
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
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
              <h2>Price Per Pod</h2>
              <Slider
                getAriaLabel={() => 'Price Per Pod'}
                value={priceFilters}
                // getAriaValueText={priceSliderText}
                valueLabelDisplay="auto"
                onChange={handlePriceFilter}
                min={0}
                max={1000000}
              />
              <Button onClick={applyFilters}>
                Apply Filter
              </Button>
            </Box>
          </Popover>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    Place in line
                  </TableCell>
                  <TableCell align="center">
                    Price per pod
                  </TableCell>
                  <TableCell align="center">
                    Initial Amount
                  </TableCell>
                  <TableCell align="center">
                    Amount Filled
                  </TableCell>
                  <TableCell align="center" />
                </TableRow>
              </TableHead>
              {myListings.map((listing) => (
                <Listing
                  key={listing.objectiveIndex}
                  listing={listing}
                  setListing={setCurrentListing}
                  isMine
                />
              ))}
            </Table>
          </TableContainer>
        </>
      ) }
      <h2 style={{ marginLeft: 12 }}>All Listings</h2>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                Place in line
              </TableCell>
              <TableCell align="center">
                Price per pod
              </TableCell>
              <TableCell align="center">
                Amount
              </TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          {otherListings.map((listing) => <Listing key={listing.objectiveIndex} listing={listing} setListing={setCurrentListing} />)}
        </Table>
      </TableContainer>
    </>
  );
}
