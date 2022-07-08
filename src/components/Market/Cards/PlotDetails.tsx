import React from 'react';
import { Card, CardProps, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from 'components/App/muiTheme';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { displayBN } from '../../../util';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export type PlotDetailsProps = {
  placeInLine: BigNumber;
  numPods: BigNumber;
}

const PlotDetails: React.FC<PlotDetailsProps & CardProps> = ({
  placeInLine,
  numPods,
  onClick
}) => (
  <Card
    sx={{
      px: 2,
      py: 2.5,
      border: 'none',
      backgroundColor: BeanstalkPalette.lightestBlue,
      cursor: onClick !== undefined ? 'pointer' : null
  }}
    onClick={onClick}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" gap={0.4}>
        <Typography sx={{ fontSize: '18px' }}>{displayBN(placeInLine)}</Typography>
        <Typography sx={{ fontSize: '18px' }}>in Line</Typography>
      </Stack>
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography sx={{ fontSize: '18px' }}>{displayBN(numPods)}</Typography>
        <img src={podIcon} alt="" height="18px" />
        {onClick !== undefined && <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}

      </Stack>
    </Stack>
  </Card>
);

export default PlotDetails;
