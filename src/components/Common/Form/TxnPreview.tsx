import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import groupBy from 'lodash/groupBy';
import { BEAN, SEEDS, STALK, USDC, SPROUTS } from 'constants/tokens';
import TokenIcon from 'components/Common/TokenIcon';
import { Action, ActionType, SiloDepositAction, parseActionMessage, SwapAction, SiloRewardsAction, SiloTransitAction } from 'util/Actions';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import Token from 'classes/Token';
import { FERTILIZER_ICONS } from 'components/BarnRaise/FertilizerImage';
import { SupportedChainId } from 'constants/chains';
import siloIcon from 'img/beanstalk/silo-icon.svg';
import { AccountTreeRounded } from '@mui/icons-material';

// -----------------------------------------------------------------------

const IconRow : React.FC<{ spacing?: number }> = ({ children, spacing = 0.75 }) => (
  <Stack direction="row" alignItems="center" sx={{ height: '100%' }} spacing={spacing}>
    {children}
  </Stack>
);
const ActionTokenImage : React.FC<{ token: Token }> = ({ token }) => (
  <img
    key={token.address}
    src={token.logo}
    alt={token.name}
    style={{ height: '100%' }}
  />
);

const SwapStep : React.FC<{ actions: SwapAction[] }> = ({ actions }) => {
  const data = actions.reduce((agg, a) => {
    if (!agg.in.addrs.has(a.tokenIn.address)) {
      agg.in.addrs.add(a.tokenIn.address);
      agg.in.elems.push(
        <ActionTokenImage key={a.tokenIn.address} token={a.tokenIn} />
      );
    }
    if (!agg.out.addrs.has(a.tokenOut.address)) {
      agg.out.addrs.add(a.tokenOut.address);
      agg.out.elems.push(
        <ActionTokenImage key={a.tokenOut.address} token={a.tokenOut} />
      );
    }
    return agg;
  }, {
    in: {
      addrs: new Set<string>(),
      elems: [] as JSX.Element[],
    },
    out: {
      addrs: new Set<string>(),
      elems: [] as JSX.Element[],
    }
  });
  return (
    <Stack direction="row" alignItems="center" sx={{ height: '100%' }} spacing={0.33}>
      {data.in.elems}
      <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
      {data.out.elems}
    </Stack>
  );
};

const TxnStep : React.FC<{
  type: ActionType;
  actions: Action[];
  highlighted: ActionType | undefined;
}> = ({
  type, 
  actions,
  highlighted,
}) => {
  let action;
  switch (type) {
    /// SWAP
    case ActionType.SWAP:
      action = (
        <SwapStep actions={actions as SwapAction[]} />
      );
      break;
    /// SILO
    case ActionType.DEPOSIT:
    case ActionType.WITHDRAW:
      action = (
        <IconRow>
          <img src={siloIcon} style={{ height: '100%' }} alt="" />
          {(actions as SiloDepositAction[]).map((a) => (
            <ActionTokenImage key={a.token.address} token={a.token} />
          ))}
        </IconRow>
      );
      break;
    case ActionType.UPDATE_SILO_REWARDS:
      action = (
        <IconRow spacing={0}>
          <Typography fontWeight="bold" sx={{ fontSize: 20 }}>{(actions[0] as SiloRewardsAction).stalk.lt(0) ? '🔥' : '+'}</Typography>
          <TokenIcon token={STALK} style={{ height: '100%' }} />
          <TokenIcon token={SEEDS} style={{ height: '100%' }} />
        </IconRow>
      );
      break;
    case ActionType.IN_TRANSIT:
      action = (
        <IconRow>
          <TokenIcon token={(actions[0] as SiloTransitAction).token} />
        </IconRow>
      );
      break;
    /// FERTILIZER
    case ActionType.BUY_FERTILIZER:
      action = (
        <IconRow>
          <TokenIcon token={USDC[SupportedChainId.MAINNET]} style={{ height: '100%', marginTop: 0, }} />
          <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
          <img src={FERTILIZER_ICONS.unused} alt="FERT" style={{ height: '100%' }} />
        </IconRow>
      );
      break;
    case ActionType.RECEIVE_FERT_REWARDS:
      action = (
        <IconRow>
          <img src={FERTILIZER_ICONS.active} alt="FERT" style={{ height: '100%' }} />
          <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
          <TokenIcon token={SPROUTS} style={{ height: '100%', marginTop: 0, }} />
        </IconRow>
      );
      break;
    default:
      break;
  }

  return (
    <Box sx={{ 
      width: '80px', 
      height: '100%', // of TXN_PREVIEW_HEIGHT
      textAlign: 'center',
      '&:first-child': {
        textAlign: 'left',
      },
      '&:last-child': {
        textAlign: 'right',
      }
    }}>
      <Box sx={{
        height: '100%',
        display: 'inline-block',
        py: 0.5,
        px: 0.5,
        mx: 'auto',
        background: 'white',
      }}>
        <Box
          display="inline-block"
          sx={{
            height: '100%',
            opacity: (highlighted === undefined || highlighted === type) ? 1 : 0.2,
          }}
        >
          {action}
        </Box>
      </Box>
    </Box>
  );
};

// -----------------------------------------------------------------------

const EXECUTION_STEPS = [
  // Group 1
  ActionType.SWAP,
  // Group 2
  ActionType.DEPOSIT,
  ActionType.WITHDRAW,
  ActionType.BUY_FERTILIZER,
  // Group 3
  ActionType.UPDATE_SILO_REWARDS,
  ActionType.RECEIVE_FERT_REWARDS,
  //
  ActionType.IN_TRANSIT,
  //
  ActionType.CLAIM_WITHDRAWAL,
];

const TXN_PREVIEW_HEIGHT = 35;
const TXN_PREVIEW_LINE_WIDTH = 5;

const TxnPreview : React.FC<{ 
  actions: Action[]
}> = ({
  actions
}) => {
  const instructionsByType = useMemo(() =>
    // actions.reduce((prev, curr) => {
    //   if (curr.type !== ActionType.BASE) {
    //     prev.grouped[curr.type] = curr;

    //   }
    //   return prev;
    // }, { grouped: {}, total: 0 }),
    // [actions]
    groupBy(actions.filter((a) => a.type !== ActionType.BASE), 'type'),
    [actions]
  );
  const instructionGroupCount = Object.keys(instructionsByType).length;
  const [highlighted, setHighlighted] = useState<ActionType | undefined>(undefined);

  if (actions.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center">
        No actions yet.
      </Typography>
    );
  }

  return (
    <Stack gap={2}>
      {instructionGroupCount > 1 ? (
        <Box sx={{
          position: 'relative',
          height: `${TXN_PREVIEW_HEIGHT}px`,
        }}>
          {/* Dotted line */}
          <Box
            sx={{
              borderColor: 'secondary.main',
              borderBottomStyle: 'dotted',
              borderBottomWidth: TXN_PREVIEW_LINE_WIDTH,
              width: '100%',
              position: 'absolute',
              left: 0,
              top: TXN_PREVIEW_HEIGHT / 2 - TXN_PREVIEW_LINE_WIDTH / 2,
              zIndex: 1,
            }}
          />
          {/* Content */}
          <Box sx={{
            position: 'relative',
            zIndex: 2,      // above the Divider
            height: '100%'  // of TXN_PREVIEW_HEIGHT
          }}>
            {/* Distribute content equally spaced
              * across the entire container */}
            <Stack 
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                height: '100%' // of TXN_PREVIEW_HEIGHT
              }}
            >
              {EXECUTION_STEPS.map((step, index) => (
                instructionsByType[step] ? (
                  <TxnStep
                    key={index}
                    type={step}
                    actions={instructionsByType[step]}
                    highlighted={highlighted}
                  /> 
                ) : null 
              ))}
            </Stack>
          </Box>
        </Box>
      ) : null}
      {/* Show highlightable explanations of each action */}
      <Stack gap={0.5}>
        {actions.map((a, index) => (
          <Box
            key={index}
            sx={{
              opacity: (highlighted === undefined || a.type === highlighted) ? 1 : 0.3,
              cursor: 'pointer'
            }}
            onMouseOver={() => setHighlighted(a.type)}
            onMouseOut={() => setHighlighted(undefined)}
            onFocus={() => setHighlighted(a.type)}
            onBlur={() => setHighlighted(undefined)}
          >
            <Typography variant="bodySmall" color="grey[300]">
              {parseActionMessage(a)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export default TxnPreview;
