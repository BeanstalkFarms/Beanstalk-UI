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
} from '@material-ui/core';
import { beanstalkContract, GetWalletAddress } from 'util/index';

function Offer({ offer, setOffer, isMine }) {
  return (
    <TableRow>
      <TableCell align="center">
        {offer.maxPlaceInLine.toString()}
      </TableCell>
      <TableCell align="center">
        {offer.pricePerPod.toString()}
      </TableCell>
      { isMine ? (
        <>
          <TableCell align="center">
            {offer.initialAmountToBuy.toString()}
          </TableCell>
          <TableCell align="center">
            {offer.amountBought.toString()}
          </TableCell>
          <TableCell align="center">
            <Button
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelBuyOffer(offer.index.toString());
              }}
            >
              Cancel
            </Button>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell align="center">
            {offer.initialAmountToBuy.minus(offer.amountBought).div(10 ** 6).toString()}
          </TableCell>
          <TableCell align="center">
            <Button
              onClick={() => {
                setOffer(offer);
              }}
            >
              Sell
            </Button>
          </TableCell>
        </>
      ) }
    </TableRow>
  );
}

export default function Offers() {
  const [walletAddress, setWalletAddress] = useState(null);
  const { buyOffers: offers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const [currentOffer, setCurrentOffer] = useState(null);

  useEffect(() => {
    const init = async () => {
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (offers == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (offers.length === 0) {
    return <div>No offers.</div>;
  }
  const sell = () => {
    console.log('sell');
  };

  const myOffers = offers.filter((offer) => offer.listerAddress === walletAddress);
  const otherOffers = offers.filter((offer) => offer.listerAddress !== walletAddress);

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
          <Button onPress={sell}>
            Sell
          </Button>
        </Box>
      </Modal>

      {myOffers.length > 0 && (
        <>
          <h2 style={{ marginLeft: 12 }}>Your Offers</h2>
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
              {offers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} isMine />)}
            </Table>
          </TableContainer>
        </>
      ) }
      <h2 style={{ marginLeft: 12 }}>All Offers</h2>
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
          {otherOffers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} />)}
        </Table>
      </TableContainer>
    </>
  );
}
