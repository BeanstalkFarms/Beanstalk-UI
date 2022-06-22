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
import { displayBN } from '../../../../util';

export type TokenStateRowProps = {
  name: string;
  amount: BigNumber;
  tooltip: string;
  token?: Token;
  bdv: BigNumber;
}

const TokenStateRow: React.FC<TokenStateRowProps> =
  ({
     name,
     amount,
     tooltip,
     token,
     bdv
   }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    return (
      <Stack direction="row" justifyContent="space-between" alignItems="start">
        <Stack direction="row" alignItems="center" gap={0.3}>
          {
            (amount.gt(0) ? (
              <CheckIcon sx={{ fontSize: '16px', color: BeanstalkPalette.logoGreen }} />
            ) : (
              <CloseIcon sx={{ fontSize: '16px', color: BeanstalkPalette.lightishGrey }} />
            ))
          }
          <Typography
            sx={{
              fontSize: '16px',
              color: amount.eq(0)
                ? BeanstalkPalette.lightishGrey
                : null
            }}
          >
            {name}
          </Typography>
          {!isMobile && (
            <Tooltip placement="right" title={tooltip}>
              <HelpOutlineIcon
                sx={{ color: 'text.secondary', fontSize: '14px' }}
              />
            </Tooltip>
          )}
        </Stack>
        <Stack direction={isMobile ? 'column' : 'row'} alignItems="center" gap={0.3}>
          {
            (token !== undefined) ? (
              // LP states
              <Stack direction={isMobile ? 'column' : 'row'} sx={{ alignItems: isMobile ? 'end' : null }} gap={0.3}>
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <img src={token?.logo} alt="Circulating Beans" height={13} />
                  <Typography
                    sx={{
                      fontSize: '16px',
                      color: amount.eq(0)
                        ? BeanstalkPalette.lightishGrey
                        : null
                    }}
                  >
                    {displayBN(amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      color: amount.eq(0)
                        ? BeanstalkPalette.lightishGrey
                        : null
                    }}
                  >
                    (~
                  </Typography>
                  <img src={greenBeanIcon} alt="Circulating Beans" width={13} />
                  <Typography
                    sx={{
                      fontSize: '16px',
                      color: bdv.eq(0)
                        ? BeanstalkPalette.lightishGrey
                        : null
                    }}
                  >
                    {displayBN(amount)}
                    )
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              // bean states
              <Stack direction="row" alignItems="center" gap={0.3}>
                <img src={greenBeanIcon} alt="Circulating Beans" width={13} />
                <Typography sx={{
                  fontSize: '16px',
                  color: amount.eq(0) ? BeanstalkPalette.lightishGrey : null
                }}>{displayBN(bdv)}
                </Typography>
              </Stack>
            )
          }
        </Stack>
      </Stack>
    );
  };

export default TokenStateRow;
