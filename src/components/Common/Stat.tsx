import { Stack, Typography, TypographyProps, StackProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';

export type StatProps = {
  /** Statistic title */
  title: string;
  /** Show a question mark with tooltip nex to the title */
  tooltip?: string;
  /** Subtext shown below the statistic (ex. "Season X") */
  bottomText?: string;
  /** Icon shown with the amount */
  icon?: JSX.Element | string;
  /** Icon shown with the title */
  topIcon?: JSX.Element | string;
  /** Stringified amount (parent should format accordingly) */
  amount: string;
  /** Typography variant to use (default: h1) */
  variant?: TypographyProps['variant'];
  /** Typography styles */
  sx?: TypographyProps['sx'];
  /** Typography color */
  color?: TypographyProps['color'];
  /** Gap between statistic elements (default: 1) */
  gap?: StackProps['gap'];
}

const Stat: React.FC<StatProps> = ({
  title,
  tooltip,
  bottomText,
  icon,
  amount,
  sx,
  variant = 'h1',
  color,
  gap = 1,
  topIcon
}) => (
  <Stack gap={gap}>
    <Typography>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {topIcon !== undefined ? topIcon : null} {title}
        {(tooltip !== undefined) && (
          <Tooltip title={tooltip} placement="top">
            <HelpOutlineIcon
              sx={{ color: 'text.secondary', fontSize: '14px' }}
            />
          </Tooltip>
        )}
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
