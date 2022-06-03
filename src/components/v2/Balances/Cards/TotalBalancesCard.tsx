/* eslint-disable */
import React, { useCallback, useMemo, useState } from 'react';
import {Alert, AlertTitle, Box, Grid, Stack, Typography} from '@mui/material';
import ResizablePieChart, { PieDataPoint } from 'components/v2/Charts/Pie';
import StatCard from '../StatCard';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBalances';
import useBeansToUSD from 'hooks/useBeansToUSD';
import useWhitelist from 'hooks/useWhitelist';
import { displayFullBN, displayUSD } from 'util/index';
import Stat from 'components/v2/Common/Stat';
export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useFarmerSiloBreakdown>;
}

type DrilldownValues = keyof TotalBalanceCardProps['breakdown'];

// Matches the key => value mapping of TotalBalanceCardProps['breakdown'],
// but without the 'bdv' key.
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
const STATE_CONFIG : { [name in DrilldownValues as Exclude<name, "totalValue">]: [name: string, color: string] } = {
  'deposited':    ['Deposited',   'rgba(70, 185, 85, 1)'],
  'withdrawn':    ['Withdrawn',   'rgba(31, 120, 180, 0.3)'],
  // 'claimable':    ['Claimable',   'rgba(178, 223, 138, 0.3)'],
  // 'circulating':  ['Circulating', 'rgba(25, 135, 59, 1)'],
  // 'wrapped':      ['Wrapped',     'rgba(25, 135, 59, 0.5)'],
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
  /** Convert Bean value to USD.  */
  const getUSD  = useBeansToUSD();
  /** Get Whitelisted Silo Tokens */
  const whitelist = useWhitelist();
  /** Drilldown against a State of Token (DEPOSITED, WITHDRAWN, etc.) */
  const [drilldown, setDrilldown] = useState<StateID | null>(null);
  
  // Drilldown handlers
  const onMouseOut = useCallback(() => setDrilldown(null), []);
  const onMouseOver = useCallback((v: StateID) => {
    return () => setDrilldown(v);
  }, [])

  const pieChartData = useMemo(() => {
    return STATE_IDS.map((id: StateID) => ({
      label: STATE_CONFIG[id][0],
      value: breakdown[id].value.toNumber(),
      color: STATE_CONFIG[id][1]
    } as PieDataPoint))
  }, [breakdown])

  return (
    <Box>
      <Stat
        title="My Balances"
        amount={`$${displayFullBN(breakdown.totalValue.abs(), 2)}`}
        icon={undefined}
      />
      <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
        <AlertTitle>Note regarding balances</AlertTitle>
        Balances are fixed to their pre-exploit values. USD value of Silo deposits are calculated using a fixed $BEAN price of <strong>$1.02027</strong>.<br/>
        Due to upgrades to the Beanstalk contract and website infrastructure, pre-exploit balances may be temporarily hidden or show incorrect values for some users. Please report issues in <strong>#ui-feedback</strong> and stay tuned for updates in <strong>#ui-updates</strong> on Discord. Upgrades will continue throughout the month of June.
      </Alert>
      {/* Left Column */}
      <Grid container direction="row" alignItems="center" sx={{ mb: 4, mt: { md: 0, xs: 0 } }} rowSpacing={2}>
        <Grid item xs={12} md={3.5}>
          <Stack>
            {STATE_IDS.map((id : StateID) => {
              return (
                <TokenRow
                  key={id}
                  name={`${STATE_CONFIG[id][0]} Tokens`}
                  value={displayUSD(breakdown[id].value)}
                  isFaded={drilldown !== null && drilldown !== id}
                  onMouseOver={onMouseOver(id)}
                  onMouseOut={onMouseOut}
                />
              )
            })}
          </Stack>
        </Grid>
        {/* Center Column */}
        <Grid item xs={12} md={5}>
          <Box display="flex" justifyContent="center" sx={{ height: 250, py: { xs: 1, md: 0 } }}>
            <ResizablePieChart
              data={breakdown.totalValue.gt(0) ? pieChartData : undefined}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={3.5}>
          {drilldown === null ? (
            <Stack alignItems="center" justifyContent="center" sx={{ pt: 5, pb: 5 }}>
              <Typography color="text.secondary">
                Hover a state to see breakdown
              </Typography>
            </Stack>
          ) : (
            <Stack gap={1}>
              <Typography variant="h2">{STATE_CONFIG[drilldown][0]} Tokens</Typography>
              <Box>
                {Object.keys(whitelist).map((address) => {
                  return (
                    <TokenRow
                      key={address}
                      name={`${whitelist[address].name}`}
                      value={displayUSD(breakdown[drilldown].valueByToken[address])}
                      onMouseOver={onMouseOver('deposited')}
                      isFaded={false}
                    />
                  )
                })}
            </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TotalBalanceCard;