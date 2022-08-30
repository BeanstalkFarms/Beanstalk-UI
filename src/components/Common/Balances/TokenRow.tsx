import React from 'react';
import { Stack, Typography, Box, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { Token } from '~/classes';
import TokenIcon from '../TokenIcon';

// ------------------------------------------------------

const TokenRow: React.FC<{
  /* Label */
  label: string;
  /* Matches color shown in pie chart */
  color?: string;
  /* */
  showColor?: boolean;
  /* If this row represents a Token, pass it */
  token?: Token;
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
  tooltip?: string | JSX.Element;
  /* Include tooltips about asset states (Deposited, Withdrawn, etc.) */
  // TODO: Refactor
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
      }) =>
  (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{
        cursor: onMouseOver ? 'pointer' : 'inherit',
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
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: showColor ? color : 'transparent',
            mt: '-2px',
            ml: '-13px'
          }} />
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

export default TokenRow;
