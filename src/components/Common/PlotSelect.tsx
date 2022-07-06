import React from 'react';
import { Stack, Typography, Card } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from '../App/muiTheme';
import { displayBN } from '../../util';
import podIcon from '../../img/beanstalk/pod-icon.svg';
import { PlotMap } from '../../state/farmer/field';

export interface PlotSelectProps {
  /** A farmer's plots */
  plots: PlotMap<BigNumber> | null;
  /** The beanstalk harvestable index */
  harvestableIndex: BigNumber;
  /** Custom function to set the selected plot index */
  handlePlotSelect: any;
}

const PlotSelect: React.FC<PlotSelectProps> = ({ plots, harvestableIndex, handlePlotSelect }) => {
  if (plots === null) {
    return null;
  }
  return (
    <>
      <Stack gap={2}>
        <Stack gap={1}>
          {Object.keys(plots).map((index) => (
            <Card
              sx={{
                p: 2,
                '&:hover': {
                  backgroundColor: BeanstalkPalette.hoverBlue,
                  cursor: 'pointer'
                }
              }}
              onClick={() => handlePlotSelect(index)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" gap={0.4}>
                  <Typography sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(index).minus(harvestableIndex))}</Typography>
                  <Typography sx={{ fontSize: '18px' }}>in Line</Typography>
                </Stack>
                <Stack direction="row" gap={0.3} alignItems="center">
                  <Typography sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(plots[index]))}</Typography>
                  <img src={podIcon} alt="" height="18px" />
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </>
  );
}

export default PlotSelect;
