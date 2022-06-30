import React from 'react';
import { Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { displayBN } from '../../../util';
import podIcon from 'img/beanstalk/pod-icon.svg';

export type PlotDetailsProps = {
  placeInLine: BigNumber;
  numPods: BigNumber;
}

const PlotDetails: React.FC<PlotDetailsProps> = ({
  placeInLine,
  numPods,
}) => (
 <Card sx={{ px: 2, py: 2.5, border: 'none', backgroundColor: BeanstalkPalette.lightestBlue }}>
   <Stack direction="row" justifyContent="space-between" alignItems="center">
     <Stack direction="row" gap={0.4}>
       <Typography sx={{ fontSize: '18px' }}>{displayBN(placeInLine)}</Typography>
       <Typography sx={{ fontSize: '18px' }}>in Line</Typography>
     </Stack>
     <Stack direction="row" gap={0.3} alignItems="center">
       <Typography sx={{ fontSize: '18px' }}>{displayBN(numPods)}</Typography>
       <img src={podIcon} alt="" height="18px" />
     </Stack>
   </Stack>
 </Card>
);

export default PlotDetails;
