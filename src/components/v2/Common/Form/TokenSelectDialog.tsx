import React, { useEffect, useMemo, useState } from 'react';

import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/v2/Common/Dialog';
import { Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TokensByAddress } from 'constants/v2/tokens';
import Token from 'classes/Token';
import { displayBN } from 'util/index';
import { AppState } from 'state';
import { zeroBN } from 'constants/index';

const useStyles = makeStyles(() => ({
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

const TokenSelectDialog : React.FC<{
  // Visibility
  open: boolean;
  handleClose: () => void;
  // Selection State
  selected: ({token: Token} & any)[];
  onSelect: (s: Set<Token>) => void;
  // Balance State
  balances: AppState['_farmer']['balances'];
  // Token Configuration
  tokenList: TokensByAddress;
}> = ({
  open,
  handleClose,
  selected,
  onSelect,
  balances,
  tokenList
}) => {
  const classes = useStyles();
  const tokenListValues = useMemo(() => Object.values(tokenList), [tokenList]);
  
  const [_selected, _setSelected] = useState<Set<Token>>(new Set());
  const toggle = (token: Token) => {
    const copy = new Set(_selected);
    if (_selected.has(token)) {
      copy.delete(token);
      _setSelected(copy);
    } else {
      copy.add(token);
      _setSelected(copy);
    }
  }

  // Whenever the Dialog opens, store a temporary copy of the currently
  // selected tokens so we can manipulate them.
  useEffect(() => {
    if (open) {
      _setSelected(
        new Set(selected.map(({ token }) => token))
      );
    }
  }, [open, selected])

  return (
    <>
      {/* Token Selector Dialog */}
      <StyledDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
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
            {tokenList ? tokenListValues.map((_token) => (
              <ListItem
                key={_token.address}
                color="primary"
                selected={_selected.has(_token)}
                disablePadding
                secondaryAction={<Typography>{displayBN(balances ? balances[_token.address] : zeroBN)}</Typography>}
                onClick={() => toggle(_token)}
              >
                <ListItemButton disableRipple={true}>
                  <ListItemIcon>
                    <img src={_token.logo} alt="" className={classes.tokenLogo} />
                  </ListItemIcon>
                  <ListItemText primary={_token.symbol} secondary={_token.name} />
                </ListItemButton>
              </ListItem>
            )) : null}
          </List>
        </StyledDialogContent>
        <StyledDialogActions>
          <Button
            onClick={() => {
              onSelect(_selected);
              handleClose();
            }}
            disabled={_selected.size === 0}
            variant="outlined"
            fullWidth
            color="primary"
            size="large"
          >
            {_selected.size === 0 
              ? "Select Token to Continue"
              : `Select ${_selected.size} Token${_selected.size === 1 ? '' : 's'}`}
          </Button>
        </StyledDialogActions>
      </StyledDialog>
    </>
  )
}
export default TokenSelectDialog;