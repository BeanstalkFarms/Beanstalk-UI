/* eslint-disable */
import React, { useCallback, useMemo, useState } from 'react';
import {Box, Grid, Stack, Typography} from '@mui/material';
import ResizablePieChart, { PieDataPoint } from 'components/v2/Charts/Pie';
import StatCard from '../StatCard';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import useUSD from 'hooks/useUSD';
import useWhitelist from 'hooks/useWhitelist';
import { displayFullBN, displayUSD } from 'util/index';
export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useSiloTokenBreakdown>;
}

type DrilldownValues = keyof TotalBalanceCardProps['breakdown'];

// Matches the key => value mapping of TotalBalanceCardProps['breakdown'],
// but without the 'bdv' key.
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
const STATE_CONFIG : { [name in DrilldownValues as Exclude<name, "bdv">]: [name: string, color: string] } = {
  'deposited':    ['Deposited',   'rgba(70, 185, 85, 1)'],
  'withdrawn':    ['Withdrawn',   'rgba(31, 120, 180, 0.3)'],
  'claimable':    ['Claimable',   'rgba(178, 223, 138, 0.3)'],
  'circulating':  ['Circulating', 'rgba(25, 135, 59, 1)'],
  'wrapped':      ['Wrapped',     'rgba(25, 135, 59, 0.5)'],
};

type StateID = keyof typeof STATE_CONFIG;
const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];

const TokenRow : React.FC<{
  name: string;
  value: string | JSX.Element;
  isFaded: boolean;
  onMouseOver?: () => void;
  onMouseOut?:  () => void;
}> = ({ 
  name,
  value,
  isFaded,
  onMouseOver,
  onMouseOut
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={{
      cursor: 'pointer',
      py: 0.5,
      opacity: isFaded ? 0.3 : 1,
    }}
    onMouseOver={onMouseOver}
    onFocus={onMouseOver}
    onMouseOut={onMouseOut}
    onBlur={onMouseOut}
  >
    <Typography color="text.secondary">
      {name}
    </Typography>
    <Typography>
      {value}
    </Typography>
  </Stack>
)

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ breakdown }) => {
  const getUSD  = useUSD();
  const whitelist = useWhitelist();
  
  const [drilldown, setDrilldown] = useState<StateID | null>(null);
  const onMouseOut = useCallback(() => setDrilldown(null), []);
  const onMouseOver = useCallback((v: StateID) => {
    return () => setDrilldown(v);
  }, [])

  const pieChartData = useMemo(() => {
    return STATE_IDS.map((id: StateID) => ({
      label: STATE_CONFIG[id][0],
      value: breakdown[id].bdv.toNumber(),
      color: STATE_CONFIG[id][1]
    } as PieDataPoint))
  }, [breakdown])

  return (
    <StatCard title="My Balances" amount={`$${displayFullBN(getUSD(breakdown.bdv), 2)}`} icon={undefined}>
      <Grid container direction="row" alignItems="center" sx={{ mb: 3}}>
        <Grid item xs={12} md={3.5}>
          <Stack>
            {STATE_IDS.map((id : StateID) => {
              return (
                <TokenRow
                  key={id}
                  name={`${STATE_CONFIG[id][0]} Tokens`}
                  value={`$${displayFullBN(getUSD(breakdown[id].bdv), 2)}`}
                  isFaded={drilldown !== null && drilldown !== id}
                  onMouseOver={onMouseOver(id)}
                  onMouseOut={onMouseOut}
                />
              )
            })}
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box display="flex" justifyContent="center" sx={{ height: 250 }}>
            <ResizablePieChart
              data={breakdown.bdv.gt(0) ? pieChartData : undefined}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={3.5}>
          {drilldown === null ? (
            <Stack alignItems="center" justifyContent="center" sx={{ p: 3, pt: 5, pb: 5 }}>
              <Typography color="text.secondary">
                Hover a state to see breakdown
              </Typography>
            </Stack>
          ) : (
            <Box>
              <Typography variant="h2">{STATE_CONFIG[drilldown][0]} Tokens</Typography>
              {Object.keys(whitelist).map((address) => {
                return (
                  <TokenRow
                    name={`${whitelist[address].name}`}
                    value={displayUSD(getUSD(breakdown[drilldown].bdvByToken[address]))}
                    onMouseOver={onMouseOver('deposited')}
                    isFaded={false}
                  />
                )
              })}
            </Box>
          )}
        </Grid>
      </Grid>
    </StatCard>
  );
};

export default TotalBalanceCard;
