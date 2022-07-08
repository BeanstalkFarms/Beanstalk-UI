import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, Typography, CardProps, Box, Card, Divider, CircularProgress } from '@mui/material';
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
import { apolloClient } from 'graph/client';

export type TWAPCardProps = {
  beanPrice: BigNumber;
  season: BigNumber;
}

type SeasonDataPoint = DataPoint & {
  season: number;
}

const PAGE_SIZE = 1000;

const ONE_WEEK_SEASONS = 168;
const ONE_MONTH_SEASONS = 672;

const getMoreSeasons = async (season_lte : number) => apolloClient.query({
  query: SEASONS_QUERY,
  variables: {
    season_lte,
    first: 1000,
  },
  // needs to be network only until we
  // figure out how to correctly slice in apollo cache
  fetchPolicy: 'network-only'
})

const useRecentSeasonsData = (range : 'week' | 'month' | 'all' = 'week') => {
  // Querying SEASONS_QUERY always returns all the data
  // in the cache
  const query = useQuery<{ seasons: any[] }>(SEASONS_QUERY, { 
    variables: {},
    fetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    (async () => {
      console.debug(`[getMoreSeasons] initializing with range = ${range}`)
      const init = await getMoreSeasons(99999999);
      /** the newest season indexed by the subgraph */
      const latestSubgraphSeason = init.data.seasons[0].seasonInt;
      /** the oldest season returned by the previous query */
      let oldestReceivedSeason = init.data.seasons[init.data.seasons.length - 1].seasonInt;
      // 
      if (range === 'all') {
        let tries = 0;
        while (oldestReceivedSeason !== 0 && tries < 20) {
          try {
            const more = await getMoreSeasons(oldestReceivedSeason); // gets 1000 more seasons, including oldestReceived
            const newOldestReceivedSeason = more.data.seasons[more.data.seasons.length - 1].seasonInt;
            if (newOldestReceivedSeason === oldestReceivedSeason) break;
            oldestReceivedSeason = newOldestReceivedSeason;
            console.debug(`[useRecentSeasonsData] query for more #${tries+1}: ended at season ${oldestReceivedSeason}`)
            tries += 1;
          } catch (e) {
            console.error(e);
            break;
          }
        }
      }
    })()
  }, [range])

  return query;
}

const TWAPCard: React.FC<TWAPCardProps & CardProps> = ({
  beanPrice,
  season,
  sx
}) => {
  const [first, setFirst] = useState(PAGE_SIZE);
  const [stop,  setStop]  = useState(false);
  const { loading, error, data } = useRecentSeasonsData('all');

  // Display values
  const [displayValue,  setDisplayValue]    = useState<number[]>([beanPrice.toNumber()]);
  const [displaySeason, setDisplaySeason]   = useState<number>(season.toNumber())
  const [isHoveringTWAP, setIsHoveringTWAP] = useState(false);

  const handleCursorTWAP = useCallback(
    (dps?: SeasonDataPoint[]) => {
      setDisplayValue(dps ? dps.map((dp) => dp.value) : [beanPrice.toNumber()]);
      setDisplaySeason(dps ? dps[0].season : season.toNumber());
    },
    [beanPrice, season]
  );

  const series = useMemo(() => {
    if (data) {
      console.debug(`[TWAPCard] Building series with ${data.seasons.length} data points`)
      const parsed : SeasonDataPoint[] = [...data.seasons].sort((a: any, b: any) => a.seasonInt - b.seasonInt).map((_season: any) => ({
        season: _season.seasonInt as number,
        // Required for SimpleLineChart
        date:   new Date(parseInt(`${_season.timestamp}000`, 10)),
        value:  parseFloat(_season.twap),
      }));
      // console.debug(`[Forecast/TWAPCard] data: `, data, parsed)
      return parsed;
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
          topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
          title="Time Weighted Average Price"
          color="primary"
          amount={`$${(displayValue[0]).toFixed(4)}`}
          icon={undefined}
          bottomText={`Season ${displaySeason.toFixed()}`}
        />
        <Stack alignItems="right">
          <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
          {/* <Typography sx={{ textAlign: 'right', pr: 0.5 }}>Last cross: 2m ago</Typography> */}
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
        {loading ? (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
            <CircularProgress variant="indeterminate" />
          </Stack>
        ) : (
          <SimpleLineChart
            isTWAP
            series={[series]}
            onCursor={handleCursorTWAP as any}
          />
        )}
      </Box>
    </Card>
  );
};

export default TWAPCard;

// This strategy won't work because the max value for 
// $skip is 5000. We'll need to manually query ranges of
// Seasons and stitch them together. This requires the current
// season being known, and the subgraph being up-to-date
// with that season.
// useEffect(() => {
//   if (!stop && !loading && !error) {
//     const currentLength =  data?.seasons.length || 0;
//     const variables = {
//       first: PAGE_SIZE, // always fetch max page size
//       skip: currentLength,
//     };
//     console.debug(`[TWAPCard] fetchMore: variables = `, variables);
//     fetchMore({ variables }).then((result) => {
//       const seasons = result.data.seasons;
//       const count = seasons.length; 
//       console.debug(`[TWAPCard] fetchMore: loaded ${count} new seasons (${seasons[0].seasonInt} - ${seasons[1].seasonInt}). result = `, result);
//       if (!currentLength || !count) {
//         setStop(true);
//       } else {
//         console.debug(`[TWAPCard], currently loaded = ${data?.seasons.length} first = ${first}, count = ${count}`, result.data.seasons[0]?.seasonInt)
//         setFirst(first + count);
//         if (count < PAGE_SIZE) setStop(true);
//       }
//     }).catch((err) => {
//       console.error(err);
//       setStop(true);
//     })
//   }
// }, [data?.seasons.length, loading, error, fetchMore, first, stop])
