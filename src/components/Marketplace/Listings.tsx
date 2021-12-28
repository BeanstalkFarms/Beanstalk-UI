import React, { useState } from 'react'
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Modal,
} from '@material-ui/core';

function Listing({ listing, setListing }) {
  return (
    <TableRow>
      <TableCell align="center">
        {listing.objectiveIndex.toString()}
      </TableCell>
      <TableCell align="center">
        {listing.pricePerPod.toString()}
      </TableCell>
      <TableCell align="center">
        {listing.initialAmount.minus(listing.amountSold).toString()}
      </TableCell>
      <TableCell align="center">
        <Button
          onClick={() => {
            setListing(listing)
          }}
        >
          Buy
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function Listings() {
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const [currentListing, setCurrentListing] = useState(null)
  const { harvestableIndex } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);
  if (listings == null) {
    return <div>Loading...</div>
  }
  if (listings.length === 0) {
    return <div>No listings.</div>
  }
  return (
    <>
      <Modal
        open={currentListing != null}
        onClose={() => setCurrentListing(null)}
      >
        <div>hi</div>
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
  )
}


