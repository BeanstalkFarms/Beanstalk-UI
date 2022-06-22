import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import useBeanstalkSiloBreakdown from 'hooks/useBeanstalkSiloBreakdown';
import { displayUSD } from 'util/index';
import ResizablePieChart, { PieDataPoint } from 'components/Charts/Pie';
import { TotalBalanceCardProps } from 'components/Balances/Cards/TotalBalancesCard';

type DrilldownValues = keyof (ReturnType<typeof useFarmerSiloBreakdown>)['states'];

// ------------------------------------------------------

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

// Matches the key => value mapping of TotalBalanceCardProps['breakdown'],
// but without the 'bdv' key.
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
const STATE_CONFIG: { [key: string]: [name: string, color: string] } = {
  deposited:    ['Deposited', 'rgba(70, 185, 85, 1)'],
  withdrawn:    ['Withdrawn', 'rgba(31, 120, 180, 0.3)'],
  claimable:    ['Claimable', 'rgba(178, 223, 138, 0.3)'],
  circulating:  ['Circulating', 'rgba(25, 135, 59, 1)'],
  wrapped:      ['Wrapped', 'rgba(25, 135, 59, 0.5)'],
};

type StateID = keyof typeof STATE_CONFIG;
const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];

// ------------------------------------------------------

const SiloBalances: React.FC<{
  breakdown: (
    ReturnType<typeof useFarmerSiloBreakdown>
    | ReturnType<typeof useBeanstalkSiloBreakdown>
  );
  whitelist: any;
}> = ({
  breakdown,
  whitelist
}) => {
  // Drilldown against a State of Token (DEPOSITED, WITHDRAWN, etc.)
  const [hoverState, setHoverState] = useState<StateID | null>(null);

  // Drilldown handlers
  const onMouseOut = useCallback(() => setHoverState(null), []);
  const onMouseOver = useCallback((v: StateID) => () => setHoverState(v), []);
  const availableStates = Object.keys(breakdown.states);

  // Compile Pie chart data
  const pieChartData = useMemo(() => availableStates.map((id) => ({
    label: STATE_CONFIG[id][0],
    value: breakdown.states[id as keyof typeof breakdown.states].value.toNumber(),
    color: STATE_CONFIG[id][1]
  } as PieDataPoint)), [breakdown, availableStates]);

  return (
    <Box>
      {/* <pre>{JSON.stringify(availableStates)}</pre> */}
      {/* <pre>{JSON.stringify(breakdown, null, 2)}</pre> */}
      <Grid container direction="row" alignItems="center" sx={{ mb: 4, mt: { md: 0, xs: 0 } }} rowSpacing={2}>
        {/**
          * Left column:
          *   Show each Token Sate [deposited, withdrawn, ...] and the total USD
          *   value of all tokens in that State.
          */}
        <Grid item xs={12} md={3.5}>
          <Stack p={1}>
            {availableStates.map((id) => (
              <TokenRow
                key={id}
                name={`${STATE_CONFIG[id][0]} Tokens`}
                value={displayUSD(breakdown.states[id as keyof typeof breakdown.states].value)}
                isFaded={hoverState !== null && hoverState !== id}
                onMouseOver={onMouseOver(id)}
              />
            ))}
          </Stack>
        </Grid>
        {/** 
          * Center Column:
          * Show a pie chart breaking down each of the above States.
          */}
        <Grid item xs={12} md={5}>
          <Box display="flex" justifyContent="center" sx={{ height: 250, py: { xs: 1, md: 0 } }}>
            <ResizablePieChart
              data={breakdown.totalValue.gt(0) ? pieChartData : undefined}
            />
          </Box>
        </Grid>
        {/**
          * Right column:
          * When hovering over a State, show a breakdown of the
          * individual tokens in that state. Ex. if there is
          * $100,000 Deposited in the Silo, how much of it is Bean?
          */}
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
                    value={displayUSD(breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[address]?.value)}
                    isFaded={false}
                  />
                ))}
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SiloBalances;
