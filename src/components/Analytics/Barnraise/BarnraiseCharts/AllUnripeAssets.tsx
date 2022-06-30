import React, { useCallback, useState } from 'react';
import { Stack, Typography, Box, Divider } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../../../Common/Stat';
import { displayBN } from '../../../../util';
import SimpleLineChart, { DataPoint } from '../../../Common/Charts/SimpleLineChart';
import { mockOwnershipPctData, mockPodRateData } from '../../../Common/Charts/SimpleLineChart.mock';
import { BeanstalkPalette } from '../../../App/muiTheme';
import TimeTabs from '../../../Common/TimeTabs';

export type AllUnripeAssetsProps = {
  beanPrice: BigNumber;
  season: BigNumber;
}

const AllUnripeAssets: React.FC<AllUnripeAssetsProps> =
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
          <Stack direction="row" gap={4}>
            <Stat
              title="Unripe Beans"
              color="primary"
              amount={`$${(isHovering ? displayTWAP[0] : beanPrice).toFixed(4)}`}
              icon={undefined}
              bottomText={`Season ${displayBN(season)}`}
            />
            <Stat
              title="Unripe LP (BDV)"
              color={BeanstalkPalette.yellow}
              amount={`$${(isHovering ? displayTWAP[0] : beanPrice).toFixed(4)}`}
              icon={undefined}
            />
          </Stack>
          <Stack alignItems="right">
            <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
          </Stack>
        </Stack>
        <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
          <SimpleLineChart series={[mockPodRateData, mockOwnershipPctData]} onCursor={handleCursor} />
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

export default AllUnripeAssets;
