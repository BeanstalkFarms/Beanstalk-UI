import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Typography, Grid, Box, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ResizablePieChart, { PieDataPoint } from '~/components/Common/Charts/PieChart';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import useFarmerBalancesBreakdown from '~/hooks/useFarmerBalancesBreakdown';
import useBeanstalkSiloBreakdown from '~/hooks/beanstalk/useBeanstalkSiloBreakdown';
import { displayFullBN, displayUSD } from '~/util';
import { Token } from '~/classes';
import TokenIcon from './TokenIcon';
import Fiat from './Fiat';

// ------------------------------------------------------

const TokenRow: React.FC<{
  /* Label */
  label: string;
  /* Matches color shown in pie chart */
  color?: string;
  /* */
  showColor?: boolean;
  /* If this row represents a Token, pass it */
  token? : Token;
  /* The amount of Token */
  amount?: string | JSX.Element;
  /* The USD value of the amount of Token */
  value?: string | JSX.Element;
  /* Fade this row out when others are selected */
  isFaded: boolean;
  /* Show a border when this row is selected */
  isSelected?: boolean;
  /* Handlers */
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  onClick?: () => void;
  /* Display a tooltip when hovering over the value */
  tooltip?: string | JSX. Element;
  /* Include tooltips about asset states (Deposited, Withdrawn, etc.) */
  assetStates?: boolean;
}> = ({
  label,
  color,
  showColor,
  token,
  amount,
  value,
  tooltip,
  assetStates = false,
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
      outline: isSelected ? `1px solid ${BeanstalkPalette.blue}` : null,
      borderRadius: 1,
    }}
    onMouseOver={onMouseOver}
    onFocus={onMouseOver}
    onMouseOut={onMouseOut}
    onBlur={onMouseOut}
    onClick={onClick}
  >
    {/* 5px gap between color and typography; shift circle back width+gap px */}
    <Stack direction="row" gap="5px" alignItems="center">
      {color && (
        <Box sx={{ width: 8, height: 8, borderRadius: 8, backgroundColor: showColor ? color : 'transparent', mt: '-2px', ml: '-13px' }} />
      )}
      <Typography variant="body1" color="text.secondary" sx={token ? { display: 'block' } : undefined}>
        {label}
      </Typography>
      {(assetStates) && (
        <Tooltip title={tooltip || ''} placement="top">
          <HelpOutlineIcon
            sx={{ color: 'text.secondary', fontSize: '14px' }}
          />
        </Tooltip>
      )}
    </Stack>
    <Tooltip title={!assetStates ? tooltip || '' : ''} placement="top">
      <Stack direction="row" alignItems="center" gap={0.5}>
        {token && <TokenIcon token={token} />}
        {amount && (
          <Typography variant="body1" textAlign="right">
            {amount}
          </Typography>
        )}
        {value && (
          <Typography variant="body1" textAlign="right" display="block">
            {value}
          </Typography>
        )}
      </Stack>
    </Tooltip>
  </Stack>
);

const STATE_CONFIG: { [key: string]: [name: string, color: string, tooltip: string] } = {
  // Silo
  deposited:    ['Deposited', BeanstalkPalette.logoGreen, 'Assets that are Deposited in the Silo.'],
  withdrawn:    ['Withdrawn', '#DFB385', 'Assets being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.'],
  claimable:    ['Claimable', '#ECBCB3', 'Assets that can be Claimed after a Withdrawal.'],
  // Farm
  farm:         ['Farm', '#F2E797', 'Assets stored in Beanstalk. Farm assets can be used in transactions on the Farm.'],
  circulating:  ['Circulating', BeanstalkPalette.lightBlue, 'Beanstalk assets in your wallet.'],
};

type StateID = keyof typeof STATE_CONFIG;
const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];

// ------------------------------------------------------

const SiloBalances: React.FC<{
  breakdown: (
    ReturnType<typeof useFarmerBalancesBreakdown>
    | ReturnType<typeof useBeanstalkSiloBreakdown>
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
                label={`${STATE_CONFIG[id][0]} ${assetLabel}s`}
                value={
                  <Fiat
                    value={breakdown.states[id as keyof typeof breakdown.states].value}
                    amount={breakdown.states[id as keyof typeof breakdown.states].value}
                  />
                  // displayUSD(breakdown.states[id as keyof typeof breakdown.states].value)
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
                {/* {Object.keys(whitelist).sort((a, b) => {
                  const _a : number = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[a]?.value.toNumber() || 0;
                  const _b : number = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[b]?.value.toNumber() || 0;
                  return _b - _a;
                }).map((address) => {
                  const token = whitelist[address];
                  const inThisState = breakdown.states[hoverState as keyof typeof breakdown.states]?.byToken[address];
                  return (
                    <TokenRow
                      key={address}
                      label={`${token.name}`}
                      color={token.color}
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
                })} */}
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default SiloBalances;
