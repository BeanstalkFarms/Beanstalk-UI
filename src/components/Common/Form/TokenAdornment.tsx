import React from 'react';
import { Box, Button, ButtonProps, InputAdornment, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Token from '~/classes/Token';
import { BeanstalkPalette, hexToRgba, IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const TokenAdornment : FC<
  {
    token: Token,
    buttonLabel?: string | JSX.Element;
  }
  & ButtonProps
> = ({
  token,
  buttonLabel,
  disabled,
  onClick,
  ...props
}) => (
  <InputAdornment position="end">
    <Button
      variant="text"
      color="primary"
      sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          border: '1px solid transparent',
          fontWeight: 'normal',
          // backgroundColor: 'primary.light',
          // '&:hover': {
          //   backgroundColor: 'primary.light',
          // }          
        }}
        // If no click handler is provided, disable so that
        // no mouse events work (i.e. no hover bg)
      disabled={disabled || !onClick}
      onClick={onClick}
      {...props}
      >
      <Row gap={0.5}>
        {token.logo ? (
          <Box
            component="img"
            src={token.logo}
            alt=""
            sx={{ 
                minWidth: IconSize.small,
                width: IconSize.small,
                height: IconSize.small
              }}
            /> 
          ) : null}
        <Box sx={{ color: 'text.tertiary' }}>
          <Typography variant="bodyMedium" fontWeight="fontWeightRegular">
            {buttonLabel || token.symbol}
          </Typography>
        </Box>
        {onClick && (
          <KeyboardArrowDownIcon
            sx={{
              fontSize: 18,
              color: hexToRgba(BeanstalkPalette.lightestGrey, 0.87)
            }}
          />
        )}
      </Row>
    </Button>
  </InputAdornment>
  );

export default TokenAdornment;
