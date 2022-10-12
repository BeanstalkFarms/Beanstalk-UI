import {
  Chip,
  Stack,
  StackProps,
  Typography,
  TypographyVariant,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import { BeanstalkToken } from '~/classes/Token';
import Stat from '~/components/Common/Stat';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';
import { BeanstalkPalette } from '../App/muiTheme';
import Row from '../Common/Row';
import TokenIcon from '../Common/TokenIcon';

export type BalanceEstimateProps = {
  delta: number | undefined;
  variant?: TypographyVariant;
  name: string;
  isDescending?: boolean;
};

export type BalanceStatProps = {
  title: string;
  token: BeanstalkToken;
  amount: BigNumber | undefined;
  amountModifier?: BigNumber;
  estimates?: BalanceEstimateProps[];
} & StackProps;

const BalanceStat: React.FC<BalanceStatProps> = ({
  title,
  token,
  amount,
  amountModifier,
  estimates,
  ...stackProps
}) => (
  <Stack spacing={0.5} {...stackProps}>
    <Stat
      variant="h4"
      gap={0.5}
      title={
        <Row gap={0.2}>
          <TokenIcon token={token} css={{ height: '20px' }} />
          <Typography>{title}</Typography>
          <ExpandCircleDownOutlinedIcon fontSize="inherit" color="primary" />
        </Row>
      }
      amount={
        <>
          {displayFullBN(amount ?? ZERO_BN, token?.displayDecimals ?? 2)}
          {amountModifier && (
            <Typography
              color="primary"
              variant="h4"
              sx={{ whiteSpace: 'nowrap' }}
            >
              + {displayFullBN(amountModifier, token?.displayDecimals ?? 2)}
            </Typography>
          )}
        </>
      }
    />
    <Stack display={{ xs: 'none', md: 'flex' }}>
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
    </Stack>
  </Stack>
);

export default BalanceStat;
