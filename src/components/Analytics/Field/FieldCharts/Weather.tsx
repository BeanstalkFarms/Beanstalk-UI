import React, { useCallback, useState } from 'react';
import { Stack, Typography, Box, Divider } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../../../Common/Stat';
import { displayBN } from '../../../../util';
import LineChart, { DataPoint } from '../../../Common/Charts/LineChart';
import { mockPodRateData } from '../../../Common/Charts/LineChart.mock';
import { BeanstalkPalette } from '../../../App/muiTheme';
import TimeTabs from '../../../Common/Charts/TimeTabs';

export type WeatherProps = {
  beanPrice: BigNumber;
  season: BigNumber;
}

const Weather: React.FC<WeatherProps> =
  ({
     children,
     season,
     beanPrice,
   }) => {
    const [displayTWAP, setDisplayTWAP] = useState<BigNumber[]>([new BigNumber(-1)]);
    const [isHovering, setIsHovering] = useState(false);
    const handleCursor = useCallback(
      (dps?: DataPoint[]) => {
        setDisplayTWAP(dps ? dps.map((dp) => new BigNumber(dp.value)) : [beanPrice]);
        setIsHovering(!!dps);
      },
      [beanPrice]
    );

    const [timeTab, setTimeTab] = useState([0,0]);
    const handleChangeTimeTab = (i: number[]) => {
      setTimeTab(i);
    };

    return (
      <>
        <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
          <Stat
            title="Weather"
            color="primary"
            amount={`$${(isHovering ? displayTWAP[0] : beanPrice).toFixed(4)}`}
            amountIcon={undefined}
            subtitle={`Season ${displayBN(season)}`}
          />
          <Stack alignItems="right">
            <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
          </Stack>
        </Stack>
        <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
          <LineChart series={[mockPodRateData]} onCursor={handleCursor} />
        </Box>
        <Box>
          <Divider color={BeanstalkPalette.lightBlue} />
          <Stack direction="row" justifyContent="space-between" sx={{ p: 0.75, pr: 2, pl: 2 }}>
            <Typography color={BeanstalkPalette.lightishGrey}>2/21</Typography>
            <Typography color={BeanstalkPalette.lightishGrey}>3/21</Typography>
            <Typography color={BeanstalkPalette.lightishGrey}>4/21</Typography>
            <Typography color={BeanstalkPalette.lightishGrey}>5/21</Typography>
            <Typography color={BeanstalkPalette.lightishGrey}>6/21</Typography>
            <Typography color={BeanstalkPalette.lightishGrey}>7/21</Typography>
          </Stack>
        </Box>
      </>
    );
  };

export default Weather;
