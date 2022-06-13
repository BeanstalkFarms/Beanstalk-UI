import { Stack, Typography, TypographyProps, StackProps } from '@mui/material';
import React from 'react';

export type StatProps = {
  title: string;
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
