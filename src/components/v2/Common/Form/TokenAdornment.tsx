import React from 'react';
import { Box, Button, ButtonProps, InputAdornment } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { makeStyles } from '@mui/styles';
import Token from 'classes/Token';

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
    minWidth: '18px',
    width: '18px',
    height: '18px',
    marginRight: '5px'
  },
  tokenName: {
    color: '#3B3B3B',
    fontSize: '20px'
  },
  tokenLogo: {
    width: 40,
    height: 40
  }
}));

const TokenAdornment : React.FC<{ token: Token } & ButtonProps> = ({ token, ...props }) => {
  const classes = useStyles();
  return (
    <InputAdornment position="end">
      <Button variant="text" color="primary" className={classes.pill} {...props}>
        {token.logo ? <img src={token.logo} alt="" className={classes.tokenIcon} /> : null}
        <Box className={classes.tokenName}>{token.symbol}</Box>
        <KeyboardArrowDownIcon
          sx={{
            marginLeft: 0.5,
            fontSize: 18,
            color: 'rgba(0,0,0,0.87)' // FIXME
          }}
        />
      </Button>
    </InputAdornment>
  );
};

export default TokenAdornment;
