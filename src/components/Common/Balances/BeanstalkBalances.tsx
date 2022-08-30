import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box } from '@mui/material';
import ResizablePieChart, { PieDataPoint } from '~/components/Common/Charts/PieChart';
import { displayBN, displayFullBN, getChainConstant } from '~/util';
import useBeanstalkSiloBreakdown from '~/hooks/beanstalk/useBeanstalkSiloBreakdown';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import { STATE_CONFIG, STATE_IDS } from '~/util/Balances';
import TokenRow from '~/components/Common/Balances/TokenRow';
import { UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';

// ------------------------------------------------------

const BeanstalkBalances: React.FC<{
  breakdown: (ReturnType<typeof useBeanstalkSiloBreakdown>);
  /* */
  assetLabel?: 'Token';
}> = ({
  breakdown,
  assetLabel = 'Token'
}) => {
  // Constants
  const WHITELIST = useWhitelist();
  const urBean = getChainConstant(UNRIPE_BEAN);
  const urBean3CRV = getChainConstant(UNRIPE_BEAN_CRV3);

  // Drilldown against a State of Token (DEPOSITED, WITHDRAWN, etc.)
  const [hoverAddress, setHoverAddress] = useState<string | null>(null);
  const [allowNewHoverState, setAllow] = useState<boolean>(true);

  // Drilldown handlers
  const onMouseOutContainer = useCallback(() => {
    if (!allowNewHoverState) {
      setHoverAddress(null);
      setAllow(true);
    }
  }, [allowNewHoverState]);

  const onMouseOver = useCallback((address: string) => (
    allowNewHoverState ? () => setHoverAddress(address) : undefined
  ), [allowNewHoverState]);

  const onClick = useCallback((address: string) => () => {
    if (!allowNewHoverState) {
      setHoverAddress(address);
      setAllow(true);
    } else {
      setHoverAddress(null);
      setAllow(false);
    }
  }, [allowNewHoverState]);

  const availableTokens = Object.keys(breakdown.tokens);

  // Compile Pie chart data
  const pieChartData = useMemo(() => {
    if (hoverAddress) {
      if (breakdown.tokens[hoverAddress]) {
        const thisAddress = breakdown.tokens[hoverAddress as keyof typeof breakdown.tokens];
        return Object.keys(thisAddress?.byState).reduce<PieDataPoint[]>((prev, state, index) => {
          const value = thisAddress?.byState[state].value.toNumber();
          prev.push({
            state: state,
            // label: STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][0],
            label: (STATE_CONFIG[state][0].length === 2)
              // farmer & beanstalk balances sometimes use different labels
              ? STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][0][0]
              : STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][0],
            value,
            color: STATE_CONFIG[STATE_IDS[index % STATE_IDS.length]][1],
          });
          return prev;
        }, []);
      }
    }
    return availableTokens.map((address) => ({
      label: WHITELIST[address].name,
      value: breakdown?.tokens[address]?.value?.toNumber(),
      color: WHITELIST[address].color
    } as PieDataPoint));
  }, [hoverAddress, availableTokens, breakdown, WHITELIST]);

  return (
    <Grid container direction="row" alignItems="center" sx={{ mb: 4, mt: { md: 0, xs: 0 }, minHeight: 300 }} rowSpacing={2}>
      {/**
        * Left column:
        *   Show each whitelisted Token and the total combined USD
        *   value of that Token across all states.
        */}
      <Grid item xs={12} md={4}>
        <Stack px={{ xs: 0, md: 1 }} py={1} onMouseLeave={onMouseOutContainer} onBlur={onMouseOutContainer}>
          {availableTokens.map((address) => (
            <TokenRow
              key={address}
              label={`${WHITELIST[address].name}`}
              color={WHITELIST[address].color}
              showColor={!hoverAddress}
              amount={
                (WHITELIST[address] === urBean || WHITELIST[address] === urBean3CRV)
                  ? '-'
                  : `${displayBN(breakdown.tokens[address as keyof typeof breakdown.tokens].amount)}`
              }
              token={(WHITELIST[address] === urBean || WHITELIST[address] === urBean3CRV) ? undefined : WHITELIST[address]}
              isFaded={hoverAddress !== null && hoverAddress !== address}
              isSelected={hoverAddress === address}
              onMouseOver={onMouseOver(address)}
              onClick={onClick(address)}
            />
          ))}
        </Stack>
      </Grid>
      {/**
        * Center Column:
        * Show a pie chart breaking down each of the above Tokens.
        */}
      <Grid item xs={12} md={4}>
        <Box display="flex" justifyContent="center" sx={{ height: 235, py: { xs: 1, md: 0 }, px: 1 }}>
          <ResizablePieChart
            title={hoverAddress ? WHITELIST[hoverAddress].name : `All ${assetLabel}s`}
            data={breakdown.totalValue.gt(0) ? pieChartData : undefined}
          />
        </Box>
      </Grid>
      {/**
        * Right column:
        * When hovering over a Token, show a breakdown of the
        * individual states of that token.
        */}
      <Grid item xs={12} md={4}>
        {hoverAddress === null ? (
          <Stack alignItems="center" justifyContent="center" sx={{ pt: 5, pb: 5 }}>
            <Typography color="text.secondary">
              Hover over a state to see breakdown
            </Typography>
          </Stack>
        ) : (
          <Stack gap={1}>
            <Typography variant="h4" sx={{ display: { xs: 'none', md: 'block' }, mx: 0.75 }}>
              {WHITELIST[hoverAddress].name}
            </Typography>
            <Box>
              {pieChartData.map((dp) => {
                const state = dp.state;
                const tokenState = breakdown.tokens[hoverAddress as keyof typeof breakdown.tokens]?.byState[state];
                return (
                  <TokenRow
                    key={state}
                    label={
                      (STATE_CONFIG[state][0].length === 2)
                        // farmer & beanstalk balances sometimes use different labels
                        ? STATE_CONFIG[state][0][0]
                        : `${STATE_CONFIG[state][0]} ${assetLabel}s`
                    }
                    color={dp.color}
                    showColor={tokenState?.amount.gt(0)}
                    isFaded={false}
                    amount={`${displayFullBN(tokenState?.amount, 2)}`}
                    assetStates
                    tooltip={STATE_CONFIG[state][2]}
                  />
                );
              })}
            </Box>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default BeanstalkBalances;
