import React, { useMemo, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import groupBy from 'lodash/groupBy';
import { SEEDS, STALK } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { Action, ActionType, DepositAction, parseActionMessage, SwapAction } from 'hooks/useDepositSummary';

// -----------------------------------------------------------------------

const TransactionStep : React.FC<{
  type: ActionType;
  instructions: Action[];
  highlighted: ActionType | undefined;
}> = ({
  type, 
  instructions,
  highlighted,
}) => (
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
      {type === ActionType.SWAP && (
        (instructions as SwapAction[]).map((instr) => (
          <img
            key={instr.tokenIn.address}
            src={instr.tokenIn.logo}
            alt={instr.tokenIn.name}
            style={{ height: '100%' }}
          />
        ))
      )}
      {type === ActionType.DEPOSIT && (
        (instructions as DepositAction[]).map((instr) => (
          <img
            key={instr.tokenIn.address}
            src={instr.tokenIn.logo}
            alt={instr.tokenIn.name}
            style={{ height: '100%' }}
          />
        ))
      )}
      {type === ActionType.RECEIVE_REWARDS && (
        <>
          <TokenIcon token={STALK} />
          <TokenIcon token={SEEDS} />
        </>
      )}
    </Box>
  </Box>
);

// -----------------------------------------------------------------------

const EXECUTION_STEPS = [
  ActionType.SWAP,
  ActionType.DEPOSIT,
  ActionType.RECEIVE_REWARDS,
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

  return (
    <Stack gap={2}>
      <Box sx={{
        position: 'relative',
        height: `${TXN_PREVIEW_HEIGHT}px`,
      }}>
        <Divider
          sx={{
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
                  instructions={instructionsByType[step]}
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
            sx={{
              py: 0.5,
              opacity: (highlighted === undefined || a.type === highlighted) ? 1 : 0.3,
              cursor: 'pointer'
            }}
            key={index}
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