import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  InputAdornment,
  Typography,
  TypographyVariant,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Token from '~/classes/Token';
import { IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const TokenAdornment: FC<
  {
    token: Token;
    buttonLabel?: string | JSX.Element;
  } & {
    iconSize?: keyof typeof IconSize;
    downArrowIconSize?: keyof typeof IconSize;
    textVariant?: TypographyVariant;
  } & ButtonProps
> = ({
  token,
  buttonLabel,
  disabled,
  onClick,
  iconSize = 'small',
  downArrowIconSize = 'small',
  textVariant = 'bodyMedium' as TypographyVariant,
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
              minWidth: IconSize[iconSize],
              width: IconSize[iconSize],
              height: IconSize[iconSize],
            }}
          />
        ) : null}
        <Box sx={{ color: '#3B3B3B' }}>
          <Typography variant={textVariant} fontWeight="fontWeightRegular">
            {buttonLabel || token.symbol}
          </Typography>
        </Box>
        {onClick && (
          <KeyboardArrowDownIcon
            sx={{
              fontSize: downArrowIconSize || 18,
              color: 'rgba(0,0,0,0.87)',
            }}
          />
        )}
      </Row>
    </Button>
  </InputAdornment>
);

export default TokenAdornment;
