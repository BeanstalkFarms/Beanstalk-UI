import React from 'react';
import { Box, Button, ButtonProps, InputAdornment, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { makeStyles } from '@mui/styles';
import Token from '~/classes/Token';
import { IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const useStyles = makeStyles(() => ({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    border: '1px solid transparent',
    fontWeight: 'normal',
    backgroundColor: 'primary.light',
    '&:hover': {
      backgroundColor: 'primary.light',
    }
  },
  tokenIcon: {
    minWidth: IconSize.small,
    width: IconSize.small,
    height: IconSize.small,
  },
  tokenName: {
    color: '#3B3B3B',
    // fontSize: '20px'
  },
  tokenLogo: {
    width: 40,
    height: 40
  }
}));

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
}) => {
  const classes = useStyles();
  return (
    <InputAdornment position="end">
      <Button
        variant="text"
        color="primary"
        className={classes.pill}
        // If no click handler is provided, disable so that
        // no mouse events work (i.e. no hover bg)
        disabled={disabled || !onClick}
        onClick={onClick}
        {...props}
      >
        <Row gap={0.5}>
          {token.logo ? <img src={token.logo} alt="" className={classes.tokenIcon} /> : null}
          {buttonLabel ? (
            <Box className={classes.tokenName}><Typography variant="bodyMedium" fontWeight="fontWeightRegular">{buttonLabel}</Typography></Box>
          ) : (
            <Box className={classes.tokenName}><Typography variant="bodyMedium" fontWeight="fontWeightRegular">{token.symbol}</Typography></Box>
          )}
          {onClick && (
            <KeyboardArrowDownIcon
              sx={{
                // marginLeft: 0.5,
                fontSize: 18,
                color: 'rgba(0,0,0,0.87)'
              }}
            />
          )}
        </Row>
      </Button>
    </InputAdornment>
  );
};

export default TokenAdornment;
