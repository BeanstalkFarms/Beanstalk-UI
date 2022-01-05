import React, { useState } from 'react';
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
} from '@material-ui/core';

function Listing({ listing, setListing }) {
  return (
    <TableRow>
      <TableCell align="center">
        {listing.objectiveIndex.div(10 ** 6).toString()}
      </TableCell>
      <TableCell align="center">
        {listing.pricePerPod.div(10 ** 6).toString()}
      </TableCell>
      <TableCell align="center">
        {listing.initialAmount.minus(listing.amountSold).div(10 ** 6).toString()}
      </TableCell>
      <TableCell align="center">
        <Button
          onClick={() => {
            setListing(listing);
          }}
        >
          Buy
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Listings() {
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const [currentListing, setCurrentListing] = useState(null);
  if (listings == null) {
    return <div>Loading...</div>;
  }
  if (listings.length === 0) {
    return <div>No listings.</div>;
  }
  const buy = () => {
    console.log('buy listing');
  };
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
          {listings.map((listing) => <Listing key={listing.objectiveIndex} listing={listing} setListing={setCurrentListing} />)}
        </Table>
      </TableContainer>
    </>
  );
}
