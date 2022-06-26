import React from 'react';
import {
  Stack,
  Typography,
  Card, Box, CardProps,
} from '@mui/material';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { BeanstalkPalette } from '../../App/muiTheme';

export type PlotDetailsCardProps = {}

const PlotDetailsCard: React.FC<PlotDetailsCardProps & CardProps> =
  ({
     sx
   }) => {
    console.log('HELLO WORLD!');
    return (
      <Card sx={{ p: 2, ...sx }}>
        <Stack gap={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" gap={0.3} alignItems="center">
              <Typography>Pod Listing</Typography>
              <Box sx={{
                px: 0.5,
                py: 0.2,
                borderRadius: 0.5,
                backgroundColor: BeanstalkPalette.washedGreen,
                color: BeanstalkPalette.logoGreen
              }}>
                <Typography>0x1243</Typography>
              </Box>
            </Stack>
            <Typography color={BeanstalkPalette.gray}>Listing expires when Plot is at
              <Typography
                display="inline"
                color={BeanstalkPalette.black}>500,000
              </Typography>
              in the Pod Line
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Stack>
              <Typography>Place in Line</Typography>
              <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography>
            </Stack>
            <Stack>
              <Typography>Pripe per Pod</Typography>
              <Stack direction="row" gap={0.3} alignItems="center">
                <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography>
                <img src={beanIcon} alt="" height="25px" />
              </Stack>
            </Stack>
            <Stack>
              <Typography>Pods Sold</Typography>
              <Stack direction="row" gap={0.3} alignItems="center">
                <Typography variant="h1" sx={{ fontWeight: 400 }}>0/113,403</Typography>
                <img src={podIcon} alt="" height="25px" />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    );
  };

export default PlotDetailsCard;
