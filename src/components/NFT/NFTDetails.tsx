import React from 'react';
import { Dialog, Stack, Typography } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import sampleNFT from '../../img/beanstalk/sample-nft.svg';
import { BeanstalkPalette } from '../App/muiTheme';

export interface NFTContentProps {

}

const NFTDetails: React.FC<NFTContentProps> = () => (
  <Stack gap={1}>
    <img src={sampleNFT} alt="" width="100%" style={{ borderRadius: '7px' }} />
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="h3">BeaNFT 358</Typography>
      <Typography color={BeanstalkPalette.lightishGrey}>BeaNFT Genesis</Typography>
    </Stack>
  </Stack>
  );

export default NFTDetails;
