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

function Offer({ offer, setOffer }) {
  console.log('got offer', offer)
  return (
    <TableRow>
      <TableCell align="center">
        {offer.maxPlaceInLine.toString()}
      </TableCell>
      <TableCell align="center">
        {offer.maxPlaceInLine.pricePerPod.toString()}
      </TableCell>
      <TableCell align="center">
        {offer.initialAmountToBuy.minus(offer.amountBought).toString()}
      </TableCell>
      <TableCell align="center">
        <Button
          onClick={() => {
            setOffer(offer)
          }}
        >
          Sell
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function Offers() {
  const { buyOffers: offers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const [currentOffer, setCurrentOffer] = useState(null)
  const { harvestableIndex } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);
  if (offers == null) {
    return <div>Loading...</div>
  }
  if (offers.length === 0) {
    return <div>No offers.</div>
  }
  const sell = () => {
    console.log('sell')
  }
  return (
    <>
      <Modal
        open={currentOffer != null}
        onClose={() => setCurrentOffer(null)}
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
          <h2>Sell this plot</h2>
          <p style={{ width: '100%', wordBreak: 'break-all' }}>{JSON.stringify(currentOffer)}</p>
          <Button>
            Sell
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
          {offers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} />)}
        </Table>
      </TableContainer>
    </>
  )
}


