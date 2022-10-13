import { Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { BeanstalkToken } from '~/classes/Token';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';

type BalanceToken = {
  token: BeanstalkToken;
  title: string;
  amount: BigNumber | undefined;
  description: string;
  pct?: BigNumber | undefined;
};

const BalancePopover: React.FC<{
  children: React.ReactNode;
  items: BalanceToken[];
  gap?: number;
  maxWidth?: number;
}> = ({ children, items, gap = 1, maxWidth }) => (
  <Card
    sx={{
      pt: 2,
      backgroundColor: BeanstalkPalette.lightYellow,
      maxWidth: maxWidth,
    }}
  >
    <Stack width="100%" spacing={2}>
      <Row gap={2} sx={{ px: 2 }} alignItems="flex-start">
        {items.map((item) => (
          <Stack
            sx={{ maxWidth: `${100 / items.length}%`, width: '100%' }}
            alignItems="flex-start"
            gap={gap}
            key={item.title}
          >
            <Stack>
              <Typography variant="bodySmall">
                <TokenIcon token={item.token} /> {item.title}
              </Typography>
              <Typography
                variant="h3"
                component="span"
                sx={{ display: 'inline-flex' }}
              >
                {displayFullBN(item.amount || ZERO_BN, 2)}
                {item.pct && (
                  <Typography
                    variant="h3"
                    fontWeight={400}
                    ml="5px"
                    sx={{ color: BeanstalkPalette.grey }}
                  >
                    ~{item.pct.toFixed(4)}%
                  </Typography>
                )}
              </Typography>
            </Stack>
            <Typography variant="bodySmall">{item.description}</Typography>
          </Stack>
        ))}
      </Row>
      {children}
    </Stack>
  </Card>
);

export default BalancePopover;
