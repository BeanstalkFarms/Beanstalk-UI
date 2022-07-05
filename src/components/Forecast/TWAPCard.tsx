import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, Typography, CardProps, Box, Card, Divider } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../Common/Stat';
import TokenIcon from '../Common/TokenIcon';
import { BEAN } from '../../constants/tokens';
import { SupportedChainId } from '../../constants';
import { displayBN } from '../../util';
import TimeTabs from '../Common/TimeTabs';
import SimpleLineChart, { DataPoint } from '../Common/Charts/SimpleLineChart';
import { mockTWAPData, mockTWAPDataVariable } from '../Common/Charts/SimpleLineChart.mock';
import { BeanstalkPalette } from '../App/muiTheme';
import { useQuery } from '@apollo/client';
import { SEASONS_QUERY } from 'graph/queries/seasons';

export type TWAPCardProps = {
  beanPrice: BigNumber;
  season: BigNumber;
}

const TWAPCard: React.FC<TWAPCardProps & CardProps> = ({
  beanPrice,
  season,
  sx
}) => {
  const { loading, error, data } = useQuery(SEASONS_QUERY, { variables: { last: 1000 } });
  const [displayTWAP, setDisplayTWAP] = useState<BigNumber[]>([beanPrice]);

  const [isHoveringTWAP, setIsHoveringTWAP] = useState(false);
  const handleCursorTWAP = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayTWAP(dps ? dps.map((dp) => new BigNumber(dp.value)) : [beanPrice]);
      // setIsHoveringTWAP(!!dps);
    },
    [beanPrice]
  );

  const series = useMemo(() => {
    if (data) {
      return data.seasons.map((_season: any) => ({
        date: new Date(parseInt(`${_season.timestamp}000`, 10)),
        value: new BigNumber(_season.twap).toNumber(),
      }))
    }
    return [];
  }, [data])

  const [timeTab, setTimeTab] = useState([0,0]);
  const handleChangeTimeTab = (i: number[]) => {
    setTimeTab(i);
  };

  return (
    <Card sx={{ width: '100%', ...sx }}>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, pt: 1.5 }}>
        <Stat
          gap={0.5}
          title="Time Weighted Average Price"
          color="primary"
          amount={`$${(displayTWAP[0]).toFixed(4)}`}
          icon={undefined}
          topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
          bottomText={`Season ${displayBN(season)}`}
        />
        <Stack alignItems="right">
          <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
          <Typography sx={{ textAlign: 'right', pr: 0.5 }}>Last cross: 2m ago</Typography>
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
        <SimpleLineChart
          isTWAP
          series={[series]}
          onCursor={handleCursorTWAP}
        />
      </Box>
      {/* <Box>
        <Divider color={BeanstalkPalette.lightBlue} />
        <Stack direction="row" justifyContent="space-between" sx={{ p: 0.75, pr: 2, pl: 2 }}>
          <Typography color={BeanstalkPalette.lightishGrey}>2/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>3/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>4/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>5/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>6/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>7/21</Typography>
        </Stack>
      </Box> */}
    </Card>
  );
};

export default TWAPCard;
