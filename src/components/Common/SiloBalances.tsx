import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box, Tooltip } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import useBeanstalkSiloBreakdown from 'hooks/useBeanstalkSiloBreakdown';
import { displayBN, displayFullBN, displayUSD } from 'util/index';
import ResizablePieChart, { PieDataPoint } from 'components/Charts/Pie';
import { TotalBalanceCardProps } from 'components/Balances/Cards/TotalBalancesCard';
import { Token } from 'classes';
import TokenIcon from './TokenIcon';
import { BeanstalkPalette } from 'components/App/muiTheme';

type DrilldownValues = keyof (ReturnType<typeof useFarmerSiloBreakdown>)['states'];

// ------------------------------------------------------

const TokenRow: React.FC<{
  name: string;
  token? : Token;
  amount?: string | JSX.Element;
  value?: string | JSX.Element;
  isFaded: boolean;
  isSelected?: boolean;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  onClick?: () => void;
  tooltip?: string | JSX. Element;
}> = ({
  name,
  token,
  amount,
  value,
  tooltip,
  isFaded = false,
  isSelected = false,
  onMouseOver,
  onMouseOut,
  onClick
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="flex-start"
    sx={{
      cursor: onMouseOver ? 'pointer' : 'inherit',
      // py: 1,
      // px: 1.25,
      py: 0.75,
      px: 0.75,
      opacity: isFaded ? 0.3 : 1,
      outline: isSelected ? `1px solid ${BeanstalkPalette.lightBlue}` : null,
      borderRadius: 1,
    }}
    onMouseOver={onMouseOver}
    onFocus={onMouseOver}
    onMouseOut={onMouseOut}
    onBlur={onMouseOut}
    onClick={onClick}
  >
    <Typography color="text.secondary" sx={token ? { display: { lg: 'block', md: 'none', xs: 'block' } } : undefined}>
      {name}
    </Typography>
    <Tooltip title={tooltip || ''}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {token && <TokenIcon token={token} />}
        {amount && (
          <Typography textAlign="right">
            {amount}
          </Typography>
        )}
        {value && (
          <Typography textAlign="right" display="block">
            {value}
          </Typography>
        )}
      </Stack>
    </Tooltip>
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
  const [allowNewHoverState, setAllow] = useState<boolean>(true);

  // Drilldown handlers
  const onMouseOutContainer = useCallback(() => { 
    if (!allowNewHoverState) {
      setHoverState(null);
      setAllow(true);
    }
  }, [allowNewHoverState]);
  const onMouseOver = useCallback((v: StateID) => (
    allowNewHoverState ? () => setHoverState(v) : undefined
  ), [allowNewHoverState]);
  const onClick = useCallback((v: StateID) => () => {
    if (allowNewHoverState === false) {
      setHoverState(v);
      setAllow(true);
    } else {
      setHoverState(null);
      setAllow(false);
    }
  }, [allowNewHoverState]);
  const availableStates = Object.keys(breakdown.states);

  // Compile Pie chart data
  const pieChartData = useMemo(() => {
    if (hoverState) {
      const thisState = breakdown.states[hoverState as keyof typeof breakdown.states];
      return Object.keys(thisState.byToken).reduce<PieDataPoint[]>((prev, addr, index) => {
        const value = thisState.byToken[addr].value.toNumber();
        if (value > 0) {
          prev.push({
            label: whitelist[addr].name,
            value,
            color: STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][1],
          });
        }
        return prev;
      }, [])
    }
    return availableStates.map((id) => ({
      label: STATE_CONFIG[id][0],
      value: breakdown.states[id as keyof typeof breakdown.states].value.toNumber(),
      color: STATE_CONFIG[id][1]
    } as PieDataPoint));
  }, [
    hoverState,
    whitelist,
    breakdown,
    availableStates
  ]);

  return (
    <div>
      {/* <pre>{JSON.stringify(availableStates)}</pre> */}
      {/* <pre>{JSON.stringify(breakdown, null, 2)}</pre> */}
      <Grid container direction="row" alignItems="center" sx={{ mb: 4, mt: { md: 0, xs: 0 } }} rowSpacing={2}>
        {/**
          * Left column:
          *   Show each Token Sate [deposited, withdrawn, ...] and the total USD
          *   value of all tokens in that State.
          */}
        <Grid item xs={12} md={4}>
          <Stack px={{ xs: 0, md: 1 }} py={1} onMouseLeave={onMouseOutContainer} onBlur={onMouseOutContainer}>
            {availableStates.map((id) => (
              <TokenRow
                key={id}
                name={`${STATE_CONFIG[id][0]} Tokens`}
                value={displayUSD(breakdown.states[id as keyof typeof breakdown.states].value)}
                isFaded={hoverState !== null && hoverState !== id}
                isSelected={hoverState === id}
                onMouseOver={onMouseOver(id)}
                onClick={onClick(id)}
              />
            ))}
          </Stack>
        </Grid>
        {/** 
          * Center Column:
          * Show a pie chart breaking down each of the above States.
          */}
        <Grid item xs={12} md={4}>
          <Box display="flex" justifyContent="center" sx={{ height: 235, py: { xs: 1, md: 0 }, px: 1 }}>
            <ResizablePieChart
              title={hoverState ? STATE_CONFIG[hoverState][0] : 'All Balances'}
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
        <Grid item xs={12} md={4}>
          {hoverState === null ? (
            <Stack alignItems="center" justifyContent="center" sx={{ pt: 5, pb: 5 }}>
              <Typography color="text.secondary">
                Hover over a state to see breakdown
              </Typography>
            </Stack>
          ) : (
            <Stack gap={1}>
              <Typography variant="h2" sx={{ display: { xs: 'none', md: 'block' }, mx: 0.75 }}>{STATE_CONFIG[hoverState][0]} Tokens</Typography>
              <Box>
                {Object.keys(whitelist).sort((a, b) => {
                  const _a : number = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[a]?.value.toNumber() || 0;
                  const _b : number = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[b]?.value.toNumber() || 0;
                  return _b - _a;
                }).map((address) => {
                  const token = whitelist[address];
                  const inThisState = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[address];
                  return (
                    <TokenRow
                      key={address}
                      name={`${token.name}`}
                      token={token}
                      isFaded={false}
                      amount={`${displayFullBN(inThisState?.amount, token.displayDecimals)} ${token.name}`}
                      tooltip={(
                        <>
                          {displayFullBN(inThisState?.amount)} {token.name}
                        </>
                      )}
                    />
                  );
                })}
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default SiloBalances;
