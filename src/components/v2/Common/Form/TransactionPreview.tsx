import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import groupBy from 'lodash/groupBy';
import { BEAN, SEEDS, STALK, USDC } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { Action, ActionType, SiloDepositAction, parseActionMessage, SwapAction } from 'util/actions';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
// import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Token from 'classes/Token';
import { FERTILIZER_ICONS } from 'components/v2/BarnRaise/FertilizerImage';
import { SupportedChainId } from 'constants/chains';

// -----------------------------------------------------------------------

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
        <ActionTokenImage token={a.tokenIn} />
      );
    }
    if (!agg.out.addrs.has(a.tokenOut.address)) {
      agg.out.addrs.add(a.tokenOut.address);
      agg.out.elems.push(
        <ActionTokenImage token={a.tokenOut} />
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
    <Stack direction="row" alignItems="center" sx={{ height: '100%' }} spacing={0.75}>
      {data.in.elems}
      <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
      {data.out.elems}
    </Stack>
  );
};

const TransactionStep : React.FC<{
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
    case ActionType.DEPOSIT:
      action = (actions as SiloDepositAction[]).map((a) => (
        <ActionTokenImage token={a.tokenIn} />
      ));
      break;
    case ActionType.SWAP:
      action = (
        <SwapStep actions={actions as SwapAction[]} />
      );
      break;
    case ActionType.RECEIVE_SILO_REWARDS:
      action = (
        <>
          <TokenIcon token={STALK} />
          <TokenIcon token={SEEDS} />
        </>
      );
      break;
    case ActionType.BUY_FERTILIZER:
      action = (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }} spacing={0.75}>
          <TokenIcon token={USDC[SupportedChainId.MAINNET]} style={{ height: '100%', marginTop: 0, }} />
          <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
          <img src={FERTILIZER_ICONS.unused} alt="FERT" style={{ height: '100%' }} />
        </Stack>
      );
      break;
    case ActionType.RECEIVE_FERT_REWARDS:
      action = (
        <Stack direction="row" alignItems="center" sx={{ height: '100%' }} spacing={0.75}>
          <img src={FERTILIZER_ICONS.active} alt="FERT" style={{ height: '100%' }} />
          <DoubleArrowIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
          <TokenIcon token={BEAN[SupportedChainId.MAINNET]} style={{ height: '100%', marginTop: 0, }} />
        </Stack>
      );
      break;
    default:
      break;
  }

  return (
    <Box sx={{
      background: 'white',
      height: '100%', // of TXN_PREVIEW_HEIGHT
      py: 0.5,
      px: 0.5,
    }}>
      <Box
        display="inline-block"
        sx={(highlighted === undefined || highlighted === type) 
          ? {
            height: '100%',
          } 
          : {
            height: '100%',
            opacity: 0.2,
          }
        }
      >
        {action}
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
  ActionType.BUY_FERTILIZER,
  // Group 3
  ActionType.RECEIVE_SILO_REWARDS,
  ActionType.RECEIVE_FERT_REWARDS,
];

const TXN_PREVIEW_HEIGHT = 35;
const TXN_PREVIEW_LINE_WIDTH = 5;

const TransactionPreview : React.FC<{ 
  actions: Action[]
}> = ({
  actions
}) => {
  const instructionsByType = useMemo(() => groupBy(actions, 'type'), [actions]);
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
      <Box sx={{
        position: 'relative',
        height: `${TXN_PREVIEW_HEIGHT}px`,
      }}>
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
        <Box sx={{
          position: 'relative',
          zIndex: 2,      // above the Divider
          height: '100%'  // of TXN_PREVIEW_HEIGHT
        }}>
          <Stack 
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              height: '100%' // of TXN_PREVIEW_HEIGHT
            }}
          >
            {EXECUTION_STEPS.map((step) => (
              instructionsByType[step] ? (
                <TransactionStep
                  key={step}
                  type={step}
                  actions={instructionsByType[step]}
                  highlighted={highlighted}
                /> 
              ) : null 
            ))}
          </Stack>
        </Box>
      </Box>
      <Stack>
        {actions.map((a, index) => (
          <Box
            key={index}
            sx={{
              py: 0.5,
              opacity: (highlighted === undefined || a.type === highlighted) ? 1 : 0.3,
              cursor: 'pointer'
            }}
            onMouseOver={() => setHighlighted(a.type)}
            onMouseOut={() => setHighlighted(undefined)}
            onFocus={() => setHighlighted(a.type)}
            onBlur={() => setHighlighted(undefined)}
          >
            <Typography color="grey[300]">
              {parseActionMessage(a)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export default TransactionPreview;
