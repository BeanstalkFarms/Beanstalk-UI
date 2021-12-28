import React from 'react'
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
} from '@material-ui/core';


function Listing({ listing }) {
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
        Buy
      </TableCell>
    </TableRow>
  )
}

export default function Listings() {
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
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
        {listings.map((listing) => <Listing key={listing.objectiveIndex} listing={listing} />)}
      </Table>
    </TableContainer>
  )
}


