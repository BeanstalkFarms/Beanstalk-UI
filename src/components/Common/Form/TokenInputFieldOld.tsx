import React, { useEffect, useMemo, useState } from 'react';
import { Theme } from '@emotion/react';
import {
  Box,
  Button,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  TextField,
  Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { makeStyles } from '@mui/styles';
import BigNumber from 'bignumber.js';

import { StyledDialog, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { displayBN } from 'util/index';
import Token from 'classes/Token';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { TokensByAddress } from 'constants/tokens';

const useStyles = makeStyles(() => ({
  //
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    border: '1px solid transparent',
    fontWeight: 'normal',
    // padding: '6px 10px 6px 13px',
    // background: theme.palette.beanstalk.lightestBlue,
    // borderRadius: '15px',
    '&:hover': {
      // borderColor: theme.palette.beanstalk.darkGrey
      // background: darken(theme.palette.beanstalk.lightestBlue, 0.1)
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

const TokenInputField : React.FC<{
  // Values
  amount: BigNumber;
  setAmount: (val?: string | BigNumber) => void;
  token: Token;
  setToken: (t: Token) => any;
  // Input props
  disabled?: boolean;
  placeholder?: string;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  //
  tokenList?: TokensByAddress | never[];
  // Styles
  sx?: SxProps<Theme> | React.CSSProperties;
}> = ({
  amount,
  setAmount,
  token,
  setToken,
  //
  disabled,
  placeholder,
  endAdornment,
  startAdornment,
  tokenList,
  sx
}) => {
  const classes = useStyles();
  const [selectingToken, setSelectingToken] = useState<boolean>(false);
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const [displayAmount, setDisplayAmount] = useState<string>(amount.toString());

  // PROBLEM:
  // BigNumber('0') is equivalent to BigNumber('0.0').
  // If a user were to try to type in a small number (0.001 ETH for example),
  // using BigNumber to track the state of the input wouldn't work; when
  // I go from 0 to 0.0 the input value would reset to 0.
  //
  // SOLUTION (temporary)
  // Allow BidTextField to maintain `displayAmount`, an internal `string` representation of the `amount`.
  // - On input change, store the string input value in displayAmount. Call the `setAmount` function with the string value also.
  // - The parent performs any necessary calculations and updates the `amount` param.
  // - In the below effect, check for edge cases:
  //    a. If `amount = -1` (i.e. the value has been cleared), reset the input.
  //    b. If `amount = BigNumber(displayAmount)` (i.e. we could have entered 0, 0.0, 0.00 // 1, 1.0, 1.00), fall back to the current `displayAmount`.
  //    c. Otherwise, update the display amount.
  useEffect(() => {
    if (amount.eq(-1)) setDisplayAmount('');
    else if (amount.eq(new BigNumber(displayAmount)) === false) setDisplayAmount(amount.toString());
  }, [amount, displayAmount]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDisplayAmount(e.target.value);
    setAmount(e.target.value);
  };
  const handleClose = () => setSelectingToken(false);
  const handleOpen = () => setSelectingToken(true);

  const TokenSelect = useMemo(() => {
    if (tokenList) {
      return (
        <InputAdornment position="end">
          <Button variant="contained" color="secondary" className={classes.pill} onClick={handleOpen}>
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
    }
    if (endAdornment) {
      return <InputAdornment position="end">{endAdornment}</InputAdornment>;
    }
    return null;
  }, [tokenList, classes, endAdornment, token]);

  const StartAdornment = () => (
    startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : null
  );

  return (
    <>
      {/* Token Selector FertDialog */}
      <StyledDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={selectingToken}
        PaperProps={{
          sx: {
            minWidth: '350px'
          }
        }}
        transitionDuration={0}
        TransitionProps={{}}
      >
        <StyledDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Select token
        </StyledDialogTitle>
        <StyledDialogContent sx={{ padding: 0 }}>
          <List sx={{ padding: 0 }}>
            {tokenList ? Object.values(tokenList).map((_token) => (
              <ListItem
                key={_token.address}
                color="primary"
                selected={token === _token}
                disablePadding
                secondaryAction={<Typography>{displayBN(balances[_token.address])}</Typography>}
                onClick={() => {
                  setToken(_token);
                  handleClose();
                }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <img src={_token.logo} alt="" className={classes.tokenLogo} />
                  </ListItemIcon>
                  <ListItemText primary={_token.symbol} secondary={_token.name} />
                </ListItemButton>
              </ListItem>
            )) : null}
          </List>
        </StyledDialogContent>
      </StyledDialog>
      {/* Input */}
      <TextField
        placeholder={placeholder || '0'}
        disabled={disabled}
        type="number"
        value={displayAmount}
        onChange={handleChange}
        onWheel={(e) => {
          // @ts-ignore
          e.target.blur();
        }}
        onKeyDown={(e) => (e.key === 'e' || e.key === '+' || e.key === '-') && e.preventDefault()}
        InputProps={{
          // Styles
          inputProps: {
            min: 0.0
            // step: token === ETH ? 1E-3 : 1.0,
            // inputMode: 'decimal'
          },
          classes: {},
          // Adornments
          endAdornment: TokenSelect,
          startAdornment: <StartAdornment />
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '1.5rem'
          },
          ...sx
        }}
      />
    </>
  );
};

export default TokenInputField;
