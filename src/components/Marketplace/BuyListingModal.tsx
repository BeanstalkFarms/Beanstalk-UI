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
          </p>
          <Button onPress={console.log('bought')}>Buy</Button>
        </Box>
      </Modal>);
};
