import {
  Stack,
  Typography,
  TypographyProps,
  StackProps,
  Tooltip,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import Row from '~/components/Common/Row';

export type StatProps = {
  /** Statistic title */
  title: JSX.Element | string;
  /** Icon shown with the title */
  titleIcon?: JSX.Element | string;
  /** Show a question mark with tooltip nex to the title */
  titleTooltip?: JSX.Element | string;
  /** Stringified amount (parent should format accordingly) */
  amount: JSX.Element | string;
  /** Icon shown with the amount */
  amountIcon?: JSX.Element | string;
  /**  */
  amountTooltip?: JSX.Element | string;
  /** Subtext shown below the statistic (ex. "Season X") */
  subtitle?: JSX.Element | string;
  /** Typography variant to use (default: h1) */
  variant?: TypographyProps['variant'];
  /** Typography styles */
  sx?: TypographyProps['sx'];
  /** Typography color */
  color?: TypographyProps['color'];
  /** Gap between statistic elements (default: 1) */
  gap?: StackProps['gap'];
};

const Stat: React.FC<StatProps> = ({
  title,
  titleIcon,
  titleTooltip = '',
  amount,
  amountIcon,
  amountTooltip = '',
  subtitle,
  // Typography
  sx,
  variant = 'h2',
  color,
  // Stack
  gap = 1,
}) => (
  <Stack gap={gap}>
    {/* Title */}
    <Typography>
      <Row gap={0.5}>
        {titleIcon && <>{titleIcon}</>}
        <Typography variant="body1">
          {title}
          {titleTooltip && (
            <Tooltip title={titleTooltip} placement="right">
              <HelpOutlineIcon
                sx={{
                  display: 'inline',
                  mb: 0.5,
                  fontSize: '11px',
                }}
              />
            </Tooltip>
          )}
        </Typography>
      </Row>
    </Typography>
    {/* Amount */}
    <Tooltip title={amountTooltip}>
      <Typography variant={variant} color={color} sx={sx}>
        <Row gap={0.5} width="100%">
          {amountIcon && <>{amountIcon}</>}
          {amount}
        </Row>
      </Typography>
    </Tooltip>
    {/* Subtitle */}
    {subtitle !== undefined && (
      <Typography variant="bodySmall" color="gray">
        {subtitle}
      </Typography>
    )}
  </Stack>
);

export default Stat;
