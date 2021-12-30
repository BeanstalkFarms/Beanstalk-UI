import React, { useState } from 'react';
import { Box, Button, MenuItem, Menu } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { CryptoAsset, displayBN, displayFullBN, TokenLabel } from 'util/index';
import { theme } from 'constants/index';
import { FormatTooltip, TokenTypeImageModule } from './index';

export default function TradeTokenInputField({
  isLP,
  token,
  handleChange,
  maxHandler,
  tokenHandler,
  poolForLPRatio,
  balance,
  hidden,
  locked,
  value,
}) {
  const [displayValue, setDisplayValue] = useState('');

  const classes = makeStyles(() => ({
    mainBox: {
      height: '85px',
      width: '100%',
      borderRadius: '24px',
      border: '1px solid rgba(0, 0, 0, 0.25)',
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      '&:hover': {
        border: '1px solid rgba(0, 0, 0, 1)',
        boxShadow: 'none',
      },
    },
    inputField: {
      width: 'calc(100% - 105px)',
      borderRadius: '24px',
      border: '0px !important',
      boxShadow: '0px !important',
      textAlign: 'right',
      padding: '18.5px 14px 18.5px 0',
      fontSize: 'calc(15px + 1vmin)',
      fontFamily: 'Lucida Console',
      fontWeight: '400',
      color: theme.text,
      backgroundColor: 'transparent',
      '&:hover': {
        textDecoration: 'none',
        boxShadow: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
    },
    labels: {
      fontSize: 'calc(9px + 0.7vmin)',
      fontFamily: 'Futura-PT',
    },
    labelContent: {
      display: 'inline-block',
      float: 'left',
      fontFamily: 'Futura-PT-Book',
      marginLeft: '13px',
      textAlign: 'left' as const,
      textTransform: 'uppercase' as const,
    },
    labelButtonContent: {
      display: 'inline-block',
      float: 'left',
      fontFamily: 'Futura-PT-Book',
      marginLeft: '3px',
      textAlign: 'left' as const,
      textTransform: 'uppercase' as const,
      width: '10px',
    },
    tokenButton: {
      backgroundColor: theme.primary,
      borderRadius: '30px',
      color: theme.accentText,
      fontSize: '13px',
      fontFamily: 'Futura-PT-Book',
      height: '40px',
      width: '100px',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 0 10px 5px',
      boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: theme.primary,
        opacity: '90%',
      },
    },
    maxButton: {
      borderRadius: '30px',
      color: theme.primary,
      fontSize: '10px',
      fontFamily: 'Futura',
      height: '20px',
      padding: '0px',
      minWidth: '20px',
    },
  }))();

  const tokenTypeImageStyle = {
    height: '20px',
    marginLeft: '5px',
    width: '24px',
  };

  const tokenList = ([CryptoAsset.Bean, CryptoAsset.Ethereum, CryptoAsset.Usdc, CryptoAsset.Dai, CryptoAsset.Usdt])
    .filter((t) => t !== token);

  function maxButton() {
    if (maxHandler !== undefined) {
      return (
        <Button onClick={maxHandler} className={classes.maxButton}>
          (Max)
        </Button>
      );
    }
  }

  const handleValueChange = (event) => {
    setDisplayValue(event.target.value);
    handleChange(event);
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event) => {
    setAnchorEl(null);
    if (event.currentTarget === undefined) {
      tokenHandler(tokenList[event]);
    }
  };

  function displayLP(val) {
    return `${displayBN(val[0])} ${TokenLabel(
      CryptoAsset.Bean
    )}/${displayBN(val[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const balanceContent =
    isLP && poolForLPRatio !== undefined
      ? displayLP(poolForLPRatio(balance))
      : `${displayFullBN(balance)} ${TokenLabel(token)}`;
  const tokenAndLabel = (t) => (
    <>
      <TokenTypeImageModule style={tokenTypeImageStyle} token={t} />
      <Box style={{ textAlign: 'right', marginLeft: '5px' }}>
        {TokenLabel(t)}
      </Box>
    </>
  );

  if (hidden) return null;

  const tokenDropdown = (
    <>
      <Button
        className={classes.tokenButton}
        id="demo-positioned-button"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <TokenTypeImageModule style={tokenTypeImageStyle} token={token} />
        <Box style={{ textAlign: 'right', marginLeft: '5px' }}>
          {TokenLabel(token)}
        </Box>
        <KeyboardArrowDownIcon />
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {Object.keys(tokenList).map((key) =>
          <MenuItem onClick={(event) => handleClose(key, event)} key={key}>
            {tokenAndLabel(tokenList[key])}
          </MenuItem>
        )}
      </Menu>
    </>
  );

  return (
    <Box className={classes.mainBox}>
      <Box style={{ height: '70%' }}>
        {tokenDropdown}
        <input
          type="number"
          placeholder="0.0000"
          className={classes.inputField}
          disabled={handleValueChange === undefined || locked}
          value={
            value.isNegative()
              ? ''
              : (displayValue.length > 1 &&
                  displayValue.replaceAll('0', '').length === 0) ||
                (value.toFixed() === '0' && displayValue === '') ||
                (displayValue.indexOf('.') > -1 &&
                  displayValue.lastIndexOf('0') === displayValue.length - 1)
              ? displayValue
              : value.toFixed()
          }
          onChange={handleValueChange}
          onWheel={(e) => e.target.blur()}
          onKeyDown={(e) =>
            (e.key === 'e' || e.key === '+' || e.key === '-') &&
            e.preventDefault()
          }
        />
      </Box>
      <Box>
        <Box className={classes.labels}>
          <FormatTooltip placement="bottom" title={balanceContent}>
            <Box className={classes.labelContent}>
              &nbsp;{`Balance: ${displayBN(balance)} ${TokenLabel(token)}`}
            </Box>
          </FormatTooltip>
          <Box className={classes.labelButtonContent}>{maxButton()}</Box>
        </Box>
      </Box>
    </Box>
  );
}

TradeTokenInputField.defaultProps = {
  hidden: false,
  locked: false,
  token: 0,
  poolForLPRatio: undefined,
};
