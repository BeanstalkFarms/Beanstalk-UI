import React from 'react';
import { Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import chevronDownIcon from '../../../../img/chevron-down.svg';
import fertilizerOpenedIcon from '../../../../img/fertilizer-opened.svg';
import beanCircleIcon from '../../../../img/tokens/bean-logo-circled.svg';
import TxnAccordion from './TxnAccordion';
import { ERC20Token, NativeToken } from '../../../../../classes/Token';

export interface AccordionProps {
  amount: BigNumber;
  token: NativeToken | ERC20Token;
}

const PurchaseDropdown: React.FC<AccordionProps> =
  ({
    amount,
    token
   }:
     AccordionProps
  ) => (
    <Stack direction="column" gap={2} justifyContent="center">
      {/* PURCHASE INFO */}
      <Stack alignItems="center" gap={1}>
        <img alt="" src={chevronDownIcon} width="20px" />
        <Stack alignItems="center" gap={0.7} sx={{ pt: 1 }}>
          <img alt="" src={fertilizerOpenedIcon} width="250px" />
          <Typography sx={{ fontSize: '18px' }}>x 10,000</Typography>
          <Typography sx={{ fontSize: '18px' }}>500% Humidity</Typography>
          <Stack direction="row" gap={0.2}>
            <img alt="" src={beanCircleIcon} width="16px" />
            <Stack direction="row" gap={0.5}>
              <Typography sx={{ fontSize: '18px' }}>50,000</Typography>
              <Typography sx={{ fontSize: '18px' }}>Fertilizer Rewards</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <TxnAccordion token={token} amount={amount} />
    </Stack>
  );
export default PurchaseDropdown;
