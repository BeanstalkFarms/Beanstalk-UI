import { Stack, Typography, TypographyProps, StackProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';

export type StatProps = {
  title: string;
  tooltip?: string;
  bottomText?: string;
  icon?: JSX.Element | string;
  topIcon?: JSX.Element | string;
  amount: string;
  variant?: TypographyProps['variant'];
  sx?: TypographyProps['sx'];
  color?: TypographyProps['color'];
  gap?: StackProps['gap'];
}

const Stat: React.FC<StatProps> =
  ({
     title,
     tooltip,
     bottomText,
     icon,
     amount,
     sx,
     variant = 'h1',
     color,
     gap,
     topIcon
  }) => (
    <Stack gap={gap !== undefined ? gap : 1}>
      <Typography>
        <Stack direction="row" alignItems="center" gap={0.5}>
          {topIcon !== undefined ? topIcon : null} {title}
          {(tooltip !== undefined) && (
            <Tooltip title={tooltip} placement="top">
              <HelpOutlineIcon
                sx={{ color: 'text.secondary', fontSize: '14px' }}
              />
            </Tooltip>
          ) }
        </Stack>
      </Typography>
      <Typography variant={variant} color={color} sx={{ marginLeft: '-3px', ...sx }}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          {icon} {amount}
        </Stack>
      </Typography>
      {bottomText !== undefined && (
        <Typography>{bottomText}</Typography>
      )}
    </Stack>
  );

export default Stat;
