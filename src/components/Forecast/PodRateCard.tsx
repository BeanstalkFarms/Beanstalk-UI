import React, { useCallback, useState } from 'react';
import { Stack, Typography, CardProps, Box, Card, Divider } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../Common/Stat';
import TokenIcon from '../Common/TokenIcon';
import { BEAN } from '../../constants/tokens';
import { SupportedChainId } from '../../constants';
import { displayBN } from '../../util';
import SimpleLineChart, { DataPoint } from '../Charts/SimpleLineChart';
import { mockPodRateData } from '../Charts/SimpleLineChart.mock';
import { BeanstalkPalette } from '../App/muiTheme';

export type TWAPCardProps = {
  podRate: BigNumber;
  season: BigNumber;
}

const PodRateCard: React.FC<TWAPCardProps & CardProps> =
  ({
     children,
     podRate,
     season,
     sx
   }) => {
    const [displayPodRate, setDisplayPodRate] = useState<BigNumber[]>([new BigNumber(-1)]);
    const [isHoveringPodRate, setIsHoveringPodRate] = useState(false);
    const handleCursorPodRate = useCallback(
      (dps?: DataPoint[]) => {
        setDisplayPodRate(dps ? dps.map((dp) => new BigNumber(dp.value)) : [podRate]);
        setIsHoveringPodRate(!!dps);
      },
      [podRate]
    );

    return (
      <Card sx={{ width: '100%', ...sx }}>
        <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
          <Stat
            title="Pod Rate"
            amount={`${displayBN(isHoveringPodRate ? displayPodRate[0] : podRate)}%`}
            icon={undefined}
            topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
            bottomText={`Season ${displayBN(season)}`}
          />
        </Stack>
        <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
          <SimpleLineChart series={[mockPodRateData]} onCursor={handleCursorPodRate} />
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
      </Card>
    );
  };

export default PodRateCard;
