import React, { useCallback, useEffect, useState } from 'react';

import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Token from 'classes/Token';
import { displayBN } from 'util/index';
import { AddressMap, ZERO_BN } from 'constants/index';
import BigNumber from 'bignumber.js';
import { FarmerBalances } from 'state/farmer/balances';
import TokenIcon from '../TokenIcon';
import { BeanstalkPalette, FontSize, IconSize } from '../../App/muiTheme';

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
    width: IconSize.large,
    height: IconSize.large,
  }
}));

export enum TokenSelectMode { MULTI, SINGLE }

const TokenSelectDialog: React.FC<{
  /** Show the dialog. */
  open: boolean;
  /** Close the dialog. */
  handleClose: () => void;
  /** The list of selected Tokens when the User opens the dialog. Updated on submit. */
  selected: ({ token: Token } & any)[];
  /** Called when the user "submits" their changes to selected tokens. */
  handleSubmit: (s: Set<Token>) => void;
  /** The Farmer's current balances. Displayed alongside each token.
   * Shows 0 for missing balances if `balances` is an object.
   * Shows nothing if `balances` is undefined`. */
  balances: FarmerBalances | undefined;
  /** A list of tokens to show in the Dialog. */
  tokenList: Token[];
  /** Single or multi-select */
  mode?: TokenSelectMode;
}> = React.memo(({
 open,
 handleClose,
 selected,
 handleSubmit,
 balances,
 tokenList,
 mode = TokenSelectMode.MULTI,
}) => {
  const classes = useStyles();
  const [newSelection, setNewSelection] = useState<Set<Token>>(new Set());

  // Toggle the selection state of a token.
  const toggle = useCallback((token: Token) => {
    const copy = new Set(newSelection);
    if (newSelection.has(token)) {
      copy.delete(token);
      setNewSelection(copy);
    } else {
      copy.add(token);
      setNewSelection(copy);
    }
  }, [newSelection]);

  // Whenever the Dialog opens, store a temporary copy of the currently
  // selected tokens so we can manipulate them quickly here without
  // affecting the form state. User needs to "confirm" the change.
  useEffect(() => {
    if (open) {
      console.debug('[TokenSelectDialog] resetting _selected');
      setNewSelection(
        new Set(selected.map(({ token }) => token))
      );
    }
  }, [open, selected]);

  // Submit the newSelection and close the dialog.
  // Accepts a param _newSelection instead of using
  // the newSelection state variable so the handler can
  // be reused with onClickItem.
  const onClickSubmit = useCallback((_newSelection: Set<Token>) => () => {
    handleSubmit(_newSelection); // update form state
    handleClose();               // hide dialog
  }, [handleSubmit, handleClose]);

  // Click an item in the token list.
  const onClickItem = useCallback((_token: Token) => {
    if (mode === TokenSelectMode.MULTI) return () => toggle(_token);
    return onClickSubmit(new Set([_token])); // submit just this token
  }, [mode, onClickSubmit, toggle]);

  if (!newSelection) return null;

  return (
    <StyledDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      PaperProps={{
        sx: {
          minWidth: '400px'
        }
      }}
      transitionDuration={0}
      TransitionProps={{}}
    >
      <StyledDialogTitle id="customized-dialog-title" onClose={handleClose}>
        {mode === TokenSelectMode.MULTI ? 'Select tokens' : 'Select token'}
      </StyledDialogTitle>
      <StyledDialogContent sx={{ padding: 1 }}>
        <List
          sx={{
            padding: 0,
            '& .MuiListItemButton-root': {
              borderRadius: 1,
              px: 1
            },
            '& .Mui-selected': {
              backgroundColor: BeanstalkPalette.washedGreen,
              borderRadius: 1,
            },
          }}
        >
          <Stack gap={1}>
            {tokenList ? tokenList.map((_token) => (
              <ListItem
                key={_token.address}
                color="primary"
                selected={newSelection.has(_token)}
                disablePadding
                secondaryAction={balances ? (
                  <Typography variant="bodyLarge">
                    {displayBN(balances?.[_token.address]?.total || ZERO_BN)}
                  </Typography>
                ) : null}
                onClick={onClickItem(_token)}
              >
                <ListItemButton disableRipple>
                  <ListItemIcon sx={{ pr: 1 }}>
                    <img src={_token.logo} alt="" className={classes.tokenLogo} />
                  </ListItemIcon>
                  <ListItemText
                    primary={_token.symbol}
                    secondary={_token.name}
                  />
                </ListItemButton>
              </ListItem>
            )) : null}
          </Stack>
        </List>
      </StyledDialogContent>
      {mode === TokenSelectMode.MULTI && (
        <StyledDialogActions>
          <Button
            onClick={onClickSubmit(newSelection)}
            disabled={newSelection.size === 0}
            variant="outlined"
            fullWidth
            color="primary"
            size="large"
          >
            {newSelection.size === 0
              ? 'Select Token to Continue'
              : `Select ${newSelection.size} Token${newSelection.size === 1 ? '' : 's'}`}
          </Button>
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
});

export default TokenSelectDialog;
