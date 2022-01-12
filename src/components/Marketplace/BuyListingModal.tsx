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
  CircularProgress,
} from '@material-ui/core';
import { beanstalkContract, GetWalletAddress, displayBN } from 'util/index';
import _ from 'lodash';
import BigNumber from 'bignumber.js';

export const BuyListingModal = (props) => {
  const currentListing = props.listing;
  if (currentListing == null) {
    return null
  }
  const {
    objectiveIndex,
    listerAddress,
    initialAmount,
    pricePerPod,
  } = currentListing;
  const onBuy = async () => {
    const beanstalk = beanstalkContract();
    // assuming we want to buy entire contract (for now), number of beans to buy is price * initial amount
    const numBeansToBuy = pricePerPod.times(initialAmount).toNumber()
    console.log('number of beanst o buy:', numBeansToBuy)

    // |amountBeans| is amount of beans to use as well, for now use 0
    await beanstalk.buyBeansAndBuyListing(objectiveIndex.toFixed(), listerAddress, 0, numBeansToBuy.toFixed());
  }
  return (
    <Modal open={currentListing != null} onClose={() => props.setCurrentListing(null)}>
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
          wat
        </p>
        <Button onClick={onBuy}>Buy</Button>
      </Box>
    </Modal>
  );
};
