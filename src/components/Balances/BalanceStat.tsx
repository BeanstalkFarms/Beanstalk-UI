import React from 'react';
import {
  Box,
  Chip,
  Stack,
  StackProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import { BeanstalkToken } from '~/classes/Token';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';
import { BeanstalkPalette, FontWeight } from '../App/muiTheme';
import Row from '../Common/Row';
import TokenIcon from '../Common/TokenIcon';

export type BalanceEstimateProps = {
  delta: BigNumber | undefined;
  name: string;
  descending?: boolean;
};

export type BalanceStatProps = {
  title: string;
  token: BeanstalkToken;
  amount: BigNumber | undefined;
  amountModifier?: string;
  modifierProps?: TypographyProps;
  estimates?: BalanceEstimateProps[];
} & StackProps;

const BalanceStat: React.FC<BalanceStatProps> = ({
  title,
  token,
  amount,
  amountModifier,
  estimates,
  modifierProps,
  ...stackProps
}) => (
  <Stack spacing={0.5} {...stackProps}>
    <Row gap={0.2}>
      <TokenIcon token={token} css={{ height: '20px' }} />
      <Typography>{title}</Typography>
      <ExpandCircleDownOutlinedIcon fontSize="inherit" color="primary" />
    </Row>
    <Row gap={0.5}>
      <Typography variant="h3">
        {displayFullBN(amount ?? ZERO_BN, token?.displayDecimals ?? 2)}
      </Typography>

      {amountModifier && (
        <Typography
          color="primary"
          variant="h3"
          {...modifierProps}
          sx={{
            whiteSpace: 'nowrap',
            fontWeight: FontWeight.normal,
            ...modifierProps?.sx,
          }}
        >
          {amountModifier}
        </Typography>
      )}
    </Row>
    <Box display={{ xs: 'none', lg: 'block' }}>
      <Stack spacing={0.6}>
        {estimates &&
          estimates.map((values, i) => {
            if (!values?.delta) return null;
            const prefix = values.descending ? '-' : '+';
            return (
              <Chip
                key={`${i}-balance-stat`}
                variant="filled"
                label={
                  <Box>
                    <Typography
                      color="primary"
                      variant="bodySmall"
                      sx={{
                        fontWeight: 700,
                        whiteSpace: 'wrap',
                      }}
                    >
                      {`${prefix} ${displayFullBN(values.delta.abs(), 0)} ${
                        values.name
                      }`}
                    </Typography>
                  </Box>
                }
                sx={{
                  py: 1,
                  width: 'max-content',
                  background: BeanstalkPalette.lightYellow,
                }}
                size="small"
              />
            );
          })}
      </Stack>
    </Box>
  </Stack>
);

export default BalanceStat;
