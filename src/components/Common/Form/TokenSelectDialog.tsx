import React, { useCallback, useEffect, useState } from 'react';

import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Token from 'classes/Token';
import { displayBN } from 'util/index';
import { ZERO_BN } from 'constants/index';
import { FarmerBalances } from 'state/farmer/balances';
import { FarmerSilo } from 'state/farmer/silo';
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

export type TokenBalanceMode = {
  'farm': FarmerBalances;
  'silo-deposits': FarmerSilo['balances'];
}

export type TokenSelectDialogProps<K extends keyof TokenBalanceMode> = {
  /** Show the dialog. */
  open: boolean;
  /** Close the dialog. */
  handleClose: () => void;
  /** The list of selected Tokens when the User opens the dialog. Updated on submit. */
  selected: ({ token: Token } & any)[];
  /** Called when the user "submits" their changes to selected tokens. */
  handleSubmit: (s: Set<Token>) => void;
  /**
   * 
   */
  balancesType?: K;
  /** The Farmer's current balances. Displayed alongside each token.
   * Shows 0 for missing balances if `balances` is an object.
   * Shows nothing if `balances` is undefined`. */
  balances: TokenBalanceMode[K] | undefined;
  // balances: FarmerSiloBalance['deposited'] | FarmerBalances | undefined;
  /** A list of tokens to show in the Dialog. */
  tokenList: Token[];
  /** Single or multi-select */
  mode?: TokenSelectMode;
  /** Override the dialog title */
  title?: string | JSX.Element;
}

type TokenSelectDialogC = React.FC<TokenSelectDialogProps<keyof TokenBalanceMode>>;

const TokenSelectDialog : TokenSelectDialogC = React.memo(({
 open,
 handleClose,
 selected,
 handleSubmit,
 balancesType = 'farm',
 balances: _balances,
 tokenList,
 mode = TokenSelectMode.MULTI,
 title,
}) => {
  const classes = useStyles();
  const [newSelection, setNewSelection] = useState<Set<Token>>(new Set());

  const getBalance = useCallback((addr: string) => {
    if (!_balances) return ZERO_BN;
    if (balancesType === 'farm') return (_balances as TokenBalanceMode['farm'])?.[addr]?.total || ZERO_BN;
    return (_balances as TokenBalanceMode['silo-deposits'])?.[addr]?.deposited?.amount || ZERO_BN;
  }, [_balances, balancesType]);

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
        {title || mode === TokenSelectMode.MULTI ? 'Select Tokens' : 'Select Token'}
      </StyledDialogTitle>
      <StyledDialogContent sx={{ padding: 1, pb: mode === TokenSelectMode.MULTI ? 0 : 2 }}>
        <Typography />
        <List sx={{ p: 0 }}>
          <Stack gap={1}>
            {tokenList ? tokenList.map((_token) => (
              <ListItem
                key={_token.address}
                color="primary"
                selected={newSelection.has(_token)}
                disablePadding
                secondaryAction={_balances ? (
                  <Typography variant="bodyLarge">
                    {displayBN(getBalance(_token.address))}
                  </Typography>
                ) : null}
                onClick={onClickItem(_token)}
                sx={{
                  // ListItem is used elsewhere so we define here
                  // instead of in muiTheme.ts
                  '& .MuiListItemText-primary': {
                    fontSize: FontSize['1xl'],
                    lineHeight: '1.875rem'
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: FontSize.base,
                    lineHeight: '1.25rem',
                    color: BeanstalkPalette.lightishGrey
                  },
                }}
              >
                <ListItemButton disableRipple>
                  <ListItemIcon sx={{ pr: 1 }}>
                    <img src={_token.logo} alt="" className={classes.tokenLogo} />
                  </ListItemIcon>
                  <ListItemText
                    primary={_token.symbol}
                    secondary={_token.name}
                    sx={{ my: 0 }}
                  />
                </ListItemButton>
              </ListItem>
            )) : null}
          </Stack>
        </List>
      </StyledDialogContent>
      {mode === TokenSelectMode.MULTI && (
        <StyledDialogActions sx={{ pb: 2 }}>
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
