import { Stack, Typography, TypographyProps, StackProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';

export type StatProps = {
  /** Statistic title */
  title: string;
  /** Icon shown with the title */
  titleIcon?: JSX.Element | string;
  /** Stringified amount (parent should format accordingly) */
  amount: string;
  /** Icon shown with the amount */
  amountIcon?: JSX.Element | string;
  /** Show a question mark with tooltip nex to the title */
  tooltip?: string;
  /** Subtext shown below the statistic (ex. "Season X") */
  subtitle?: string;
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
  titleIcon,
  amount,
  amountIcon,
  tooltip = '',
  subtitle,
  // Typography
  sx,
  variant = 'h1',
  color,
  // Stack
  gap = 1,
}) => (
  <Stack gap={gap}>
    {/* Title */}
    <Typography>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {titleIcon && <>{titleIcon}</>}
        <Typography variant="body1">
          {title}
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <HelpOutlineIcon
                sx={{
                  // color: 'text.secondary',
                  display: 'inline',
                  mb: 0.5,
                  fontSize: '11px',
                }}
              />
            </Tooltip>
          )}
        </Typography>
      </Stack>
    </Typography>
    {/* Amount */}
    <Typography variant={variant} color={color} sx={sx}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {amountIcon && <>{amountIcon}</>}{amount}
      </Stack>
    </Typography>
    {/* Subtitle */}
    {subtitle !== undefined && (
      <Typography variant="bodySmall" color="gray">{subtitle}</Typography>
    )}
  </Stack>
);

export default Stat;
