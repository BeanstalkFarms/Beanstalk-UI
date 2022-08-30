import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box } from '@mui/material';
import ResizablePieChart, { PieDataPoint } from '~/components/Common/Charts/PieChart';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { displayFullBN, displayUSD } from '~/util';
import Fiat from '../Fiat';
import { STATE_CONFIG, STATE_IDS, StateID } from '~/util/Balances';
import TokenRow from '~/components/Common/Balances/TokenRow';

// ------------------------------------------------------

const FarmerBalances: React.FC<{
  breakdown: (
    ReturnType<typeof useFarmerBalancesBreakdown>
  );
  /* */
  assetLabel?: 'Balance' | 'Asset';
  whitelist: any;
}> = ({
  breakdown,
  whitelist,
  assetLabel = 'Balance'
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
    if (!allowNewHoverState) {
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
        prev.push({
          tokenAddress: addr,
          label: whitelist[addr].name,
          value,
          color: STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][1],
        });
        return prev;
      }, []).sort((a, b) => b.value - a.value);
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
                label={
                  (STATE_CONFIG[id][0].length === 2)
                    // farmer & beanstalk balances sometimes use different labels
                    ? STATE_CONFIG[id][0][1]
                    : `${STATE_CONFIG[id][0]} ${assetLabel}s`
                }
                value={
                  <Fiat
                    value={breakdown.states[id as keyof typeof breakdown.states].value}
                    amount={breakdown.states[id as keyof typeof breakdown.states].value}
                  />
                }
                isFaded={hoverState !== null && hoverState !== id}
                isSelected={hoverState === id}
                onMouseOver={onMouseOver(id)}
                onClick={onClick(id)}
                assetStates
                tooltip={`${STATE_CONFIG[id][2]}`}
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
              title={hoverState ? STATE_CONFIG[hoverState][0] : `All ${assetLabel}s`}
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
              <Typography variant="h4" sx={{ display: { xs: 'none', md: 'block' }, mx: 0.75 }}>
                {STATE_CONFIG[hoverState][0]} {assetLabel}s
              </Typography>
              <Box>
                {pieChartData.map((dp) => {
                  const token = whitelist[dp.tokenAddress];
                  const inThisState = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[token.address];
                  return (
                    <TokenRow
                      key={token.address}
                      label={`${token.symbol}`}
                      color={dp.color}
                      showColor={inThisState?.amount.gt(0)}
                      token={token}
                      isFaded={false}
                      amount={`${displayFullBN(inThisState?.amount, token.displayDecimals)}`}
                      tooltip={(
                        <>
                          <Typography variant="h4">{token.name}</Typography>
                          {displayFullBN(inThisState?.amount)} {token.symbol}<br />
                          ≈ {displayUSD(inThisState?.value)}
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

export default FarmerBalances;
