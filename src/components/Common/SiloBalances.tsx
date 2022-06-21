import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import useBeanstalkSiloBreakdown from 'hooks/useBeanstalkSiloBreakdown';
import { displayUSD } from 'util/index';
import ResizablePieChart, { PieDataPoint } from 'components/Charts/Pie';
import { TotalBalanceCardProps } from 'components/Balances/Cards/TotalBalancesCard';

const TokenRow: React.FC<{
  name: string;
  value: string | JSX.Element;
  isFaded: boolean;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
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
);

export type SiloBalancesProps = {
  breakdown: ReturnType<typeof useFarmerSiloBreakdown | typeof useBeanstalkSiloBreakdown>;
  whitelist: any;
}

type DrilldownValues = keyof TotalBalanceCardProps['breakdown'];

// Matches the key => value mapping of TotalBalanceCardProps['breakdown'],
// but without the 'bdv' key.
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
const STATE_CONFIG: { [name in DrilldownValues as Exclude<name, 'totalValue'>]: [name: string, color: string] } = {
  deposited: ['Deposited', 'rgba(70, 185, 85, 1)'],
  withdrawn: ['Withdrawn', 'rgba(31, 120, 180, 0.3)'],
  claimable: ['Claimable', 'rgba(178, 223, 138, 0.3)'],
  circulating: ['Circulating', 'rgba(25, 135, 59, 1)'],
  wrapped: ['Wrapped', 'rgba(25, 135, 59, 0.5)'],
};

type StateID = keyof typeof STATE_CONFIG;
const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];

const SiloBalances: React.FC<SiloBalancesProps> = ({ breakdown, whitelist }) => {
  // const WHITELIST = useWhitelist();

  // Drilldown against a State of Token (DEPOSITED, WITHDRAWN, etc.)
  const [hoverState, setHoverState] = useState<StateID | null>(null);

  // Drilldown handlers
  const onMouseOut = useCallback(() => setHoverState(null), []);
  const onMouseOver = useCallback((v: StateID) => () => setHoverState(v), []);

  // Compile Pie chart data
  const pieChartData = useMemo(() => STATE_IDS.map((id: StateID) => ({
    label: STATE_CONFIG[id][0],
    value: breakdown[id].value.toNumber(),
    color: STATE_CONFIG[id][1]
  } as PieDataPoint)), [breakdown]);

  return (
    <Grid container direction="row" alignItems="center" sx={{ mb: 4, mt: { md: 0, xs: 0 } }} rowSpacing={2}>
      <Grid item xs={12} md={3.5}>
        <Stack p={1}>
          {STATE_IDS.map((id: StateID) => (
            <TokenRow
              key={id}
              name={`${STATE_CONFIG[id][0]} Tokens`}
              value={displayUSD(breakdown[id].value)}
              isFaded={hoverState !== null && hoverState !== id}
              onMouseOver={onMouseOver(id)}
              onMouseOut={onMouseOut}
            />
          ))}
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
        {hoverState === null ? (
          <Stack alignItems="center" justifyContent="center" sx={{ pt: 5, pb: 5 }}>
            <Typography color="text.secondary">
              Hover over a state to see breakdown
            </Typography>
          </Stack>
        ) : (
          <Stack gap={1}>
            <Typography variant="h2">{STATE_CONFIG[hoverState][0]} Tokens</Typography>
            <Box>
              {Object.keys(whitelist).map((address) => (
                <TokenRow
                  key={address}
                  name={`${whitelist[address].name}`}
                  value={displayUSD(breakdown[hoverState]?.byToken[address].value)}
                  onMouseOver={onMouseOver('deposited')}
                  isFaded={false}
                />
              ))}
            </Box>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default SiloBalances;
