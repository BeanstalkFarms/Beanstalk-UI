import React from 'react';
import { Box } from '@mui/material';
import { displayFullBN, TokenLabel } from 'util/index';
import { StyledTooltip } from '.';

export default function BalanceField(props) {
  const title =
    props.token !== undefined
      ? `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`
      : displayFullBN(props.balance);

  return (
    <StyledTooltip title={title} placement="right">
      <span>
        {props.content !== undefined ? (
          props.content
        ) : (
          <Box style={props.style}>{props.balance}</Box>
        )}
      </span>
    </StyledTooltip>
  );
}
