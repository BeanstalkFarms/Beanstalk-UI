import React from 'react';
import { Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { BeanstalkPalette } from 'components/App/muiTheme';
import greenBeanIcon from 'img/tokens/bean-logo-circled.svg';
import { useTheme } from '@mui/material/styles';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN } from '../../../util';

const UnripeTokenRow: React.FC<{
  name: string;
  amount: BigNumber;
  bdv?: BigNumber;
  tooltip: string | React.ReactElement;
  token: Token;
}> = ({
  name,
  amount,
  bdv,
  tooltip,
  token,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const primaryColor = amount.eq(0) ? BeanstalkPalette.lightishGrey : null;
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="start">
      <Stack direction="row" alignItems="center" gap={0.4}>
        {amount.gt(0) ? (
          <CheckIcon sx={{ fontSize: 16, color: BeanstalkPalette.logoGreen }} />
        ) : (
          <CloseIcon sx={{ fontSize: 16, color: BeanstalkPalette.lightishGrey }} />
        )}
        <Typography
          sx={{
            color: primaryColor,
            textTransform: 'capitalize'
          }}
        >
          {name}
        </Typography>
        {!isMobile && (
          <Tooltip placement="right" title={tooltip}>
            <HelpOutlineIcon
              sx={{ color: BeanstalkPalette.lightishGrey, fontSize: '13px' }}
            />
          </Tooltip>
        )}
      </Stack>
      <Stack direction={isMobile ? 'column' : 'row'} alignItems="center" gap={0.3}>
        {(amount && bdv) ? (
          // LP states
          <Stack direction={isMobile ? 'column' : 'row'} sx={{ alignItems: isMobile ? 'end' : null }} gap={0.5}>
            <Stack direction="row" alignItems="center" gap={0.3}>
              <img src={token.logo} alt="Circulating Beans" height={13} />
              <Typography sx={{ color: primaryColor }}>
                {displayFullBN(amount)}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.3}>
              <Typography sx={{ color: primaryColor }}>
                (
              </Typography>
              <img src={greenBeanIcon} alt="Circulating Beans" width={13} />
              <Typography sx={{ color: primaryColor }}>
                {displayFullBN(bdv)}
                )
              </Typography>
            </Stack>
          </Stack>
        ) : (
          // Bean states
          <Stack direction="row" alignItems="center" gap={0.3}>
            <img src={greenBeanIcon} alt="Circulating Beans" width={13} />
            <Typography sx={{
              fontSize: '16px',
              color: amount.eq(0) ? BeanstalkPalette.lightishGrey : null
            }}>
              {displayFullBN(amount)}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default UnripeTokenRow;
