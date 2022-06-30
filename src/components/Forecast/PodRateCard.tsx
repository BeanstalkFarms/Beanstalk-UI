import React, { useCallback, useState } from 'react';
import { Box, Card, CardProps, Divider, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../Common/Stat';
import { displayBN } from '../../util';
import SimpleLineChart, { DataPoint } from '../Common/Charts/SimpleLineChart';
import { mockPodRateData } from '../Common/Charts/SimpleLineChart.mock';
import { BeanstalkPalette } from '../App/muiTheme';
import TimeTabs from "../Common/TimeTabs";

export type TWAPCardProps = {
  podRate: BigNumber;
  season: BigNumber;
}

const PodRateCard: React.FC<TWAPCardProps & CardProps> = ({
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

  const [timeTab, setTimeTab] = useState([0,0]);
  const handleChangeTimeTab = (i: number[]) => {
    setTimeTab(i);
  };

  return (
    <Card sx={{ width: '100%', ...sx }}>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, pt: 1.5 }}>
        <Stat
          gap={0.5}
          title="Pod Rate"
          amount={`${displayBN(isHoveringPodRate ? displayPodRate[0] : podRate)}%`}
          icon={undefined}
          bottomText={`Season ${displayBN(season)}`}
        />
        <Stack alignItems="right">
          <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
        </Stack>
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
