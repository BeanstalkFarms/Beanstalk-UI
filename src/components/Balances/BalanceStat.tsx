import { Box, Chip, Stack, Typography, TypographyVariant } from '@mui/material';
import React from 'react';
import Stat, { StatProps } from '~/components/Common/Stat';
import { BeanstalkPalette } from '../App/muiTheme';

export type BalanceEstimateProps = {
  delta: number | undefined;
  variant?: TypographyVariant;
  name: string;
  isDescending?: boolean;
};

export interface BalanceStatProps extends StatProps {
  estimates?: BalanceEstimateProps[];
}

const BalanceStat: React.FC<BalanceStatProps> = ({
  estimates,
  ...statProps
}) => (
  <Stack spacing={0.5}>
    <Stat {...statProps} />
    <Box display={{ xs: 'none', md: 'block' }}>
      {estimates &&
        estimates.map(({ delta, name, isDescending = false, variant }, i) => (
          <Chip
            key={`${i}-balance-stat`}
            variant="filled"
            label={
              <Typography
                color="primary"
                variant={variant ?? 'bodySmall'}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                }}
              >
                {`${isDescending ? '-' : '+'} ${delta} ${name}`}
              </Typography>
            }
            sx={{
              py: 1,
              width: 'max-content',
              background: BeanstalkPalette.lightYellow,
            }}
            size="small"
          />
        ))}
    </Box>
  </Stack>
);

export default BalanceStat;
