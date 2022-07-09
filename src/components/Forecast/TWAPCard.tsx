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
import { apolloClient } from 'graph/client';
import { useSeasonsLazyQuery, useSeasonsQuery } from 'generated/graphql';

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

// const getMoreSeasons = async (season_lte : number) => apolloClient.query({
//   query: SEASONS_QUERY,
//   variables: {
//     season_lte,
//     first: 1000,
//   },
//   // needs to be network only until we
//   // figure out how to correctly slice in apollo cache
//   fetchPolicy: 'network-only'
// })

type Range = 'week' | 'month' | 'all';
const RANGE_TO_SEASONS : { [key in Range]: number | undefined } = {
  'week': 168,
  'month': 672,
  'all': undefined,
}

const useRecentSeasonsData = (range : Range = 'week') => {
  // Querying SEASONS_QUERY always returns all the data
  // in the cache
  // const query = useQuery<{ seasons: any[] }>(SEASONS_QUERY, { 
  //   variables: {},
  //   fetchPolicy: 'cache-only',
  //   notifyOnNetworkStatusChange: true,
  // });

  const [first, setFirst] = useState(RANGE_TO_SEASONS[range]);

  const [get, query] = useSeasonsLazyQuery({
    variables: {},
    // fetchPolicy: 'cache-only',
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    (async () => {
      console.debug(`[useRecentSeasonsData] initializing with range = ${range}`)
      try {
        if (range !== 'all') {
          // data.seasons is sorted by season, descending.
          const init = await get({
            variables: { 
              first: RANGE_TO_SEASONS[range], 
              season_lte: 999999999
            },
            fetchPolicy: 'cache-first',
          }); 
        } else {
          
          // Initialize Season data with a call to the first 
          // set of Seasons.
          const init = await get({
            variables: { 
              first: PAGE_SIZE, 
              season_lte: undefined
            },
          }); 

          console.debug(`[useRecentSeasonsData] init: data = `, init.data)
          
          if (!init.data) throw new Error('missing data');
          
          /** the newest season indexed by the subgraph 
           * data is returned sorted from oldest to newest
           * so season 0 is the oldest season and length-1 is newest. */
          const latestSubgraphSeason = init.data.seasons[0].seasonInt;

          /** the oldest season returned by the previous query;
           * requires that results are sorted by seasonInt descending*/
          const oldestReceivedSeason = init.data.seasons[init.data.seasons.length - 1].seasonInt;

          // 
          if (range === 'all') {
            console.debug(`[useRecentSeasonsData] requested all seasons. current season is ${latestSubgraphSeason}. oldest loaded season ${oldestReceivedSeason}`, init.data.seasons);

            // 3000 / 1000 = 3 queries
            // Season    1 - 1000
            //        1001 - 2000
            //        2001 - 3000
            const numQueries = Math.ceil(oldestReceivedSeason / PAGE_SIZE);
            const promises = [];
            console.debug(`[useRecentSeasonsData] needs ${numQueries} calls to get ${oldestReceivedSeason} more seasons`)
            for (let i = 0; i < numQueries; i += 1) {
              const season = Math.max(
                0, // always at least 0
                oldestReceivedSeason - i*PAGE_SIZE,
              );
              promises.push(
                get({
                  variables: {
                    first: 1000,
                    season_lte: season,
                  },
                  fetchPolicy: 'network-only'
                })
              )
            }

            await Promise.all(promises);

            await get({
              variables: {
                first: undefined, // get all entries
                season_lte: latestSubgraphSeason,
              },
              fetchPolicy: 'cache-only',
            });
          }

          // let tries = 1;
          // while (oldestReceivedSeason !== 0 && tries < 10) {
          //   try {
          //     // gets 1000 more seasons, including oldestReceived
          //     const more = await get({
          //       variables: {
          //         first: 1000,
          //         season_lte: oldestReceivedSeason,
          //       },
          //       // fetchPolicy: 'network-only',
          //     }); 

          //     console.debug(`[useRecentSeasonsData] QUERY #${tries} = `, more)
          //     if (!more.data) throw new Error('missing more data');
              
          //     const left  = more.data.seasons[0].seasonInt;
          //     const right = more.data.seasons[more.data.seasons.length - 1].seasonInt;
          //     const big   = Math.max(left, right);
          //     const small = Math.min(left, right);

          //     console.debug(`[useRecentSeasonsData] QUERY #${tries} count = ${more.data?.seasons.length}, new oldest = ${small}`)
          //     if (small === oldestReceivedSeason) {
          //       console.debug(`[useRecentSeasonsData] QUERY #${tries} fetched all seasons, breaking...`);
          //       break;
          //     }
          //     oldestReceivedSeason = small;
          //     console.debug(`[useRecentSeasonsData] QUERY #${tries} ended at season ${oldestReceivedSeason}`)
          //     tries += 1;
          //   } catch (e) {
          //     console.debug(`failed to load`);
          //     console.error(e);
          //     break;
          //   }
          // }
        }
      } catch (e) {
        console.debug(`[useRecentSeasonsData] failed`);
        console.error(e)
      }
    })()
  }, [range, get])

  return query; 
}

const tabToRange = ['week', 'month', 'all'] as const;

const TWAPCard: React.FC<TWAPCardProps & CardProps> = ({
  beanPrice,
  season,
  sx
}) => {
  const [first, setFirst] = useState(PAGE_SIZE);
  const [stop,  setStop]  = useState(false);
  const [timeTab, setTimeTab] = useState([0,0]);
  const handleChangeTimeTab = (i: number[]) => {
    setTimeTab(i);
  };

  const { loading, error, data } = useRecentSeasonsData(tabToRange[timeTab[1]]);

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
    console.debug(`[TWAPCard] Building series with ${data?.seasons.length || 0} data points`/*, data?.seasons, error*/)
    if (data) {
      const parsed : SeasonDataPoint[] = [...data.seasons].filter((x) => !!x).sort((a, b) => a.seasonInt - b.seasonInt).map((_season: any) => ({
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
        {loading || series.length === 0 ? (
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
