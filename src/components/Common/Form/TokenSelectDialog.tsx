import React, { useCallback, useEffect, useState } from 'react';

import { Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import Token from '~/classes/Token';
import { displayBN } from '~/util';
import { ZERO_BN } from '~/constants';
import { FarmerBalances } from '~/state/farmer/balances';
import { FarmerSilo } from '~/state/farmer/silo';
import { BeanstalkPalette, FontSize } from '../../App/muiTheme';

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
    width: 44,
    height: 44,
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
  balances?: TokenBalanceMode[K] | undefined;
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
  /** keep an internal copy of selected tokens */
  const [selectedInternal, setSelectedInternal] = useState<Set<Token>>(new Set());

  const getBalance = useCallback((addr: string) => {
    if (!_balances) return ZERO_BN;
    if (balancesType === 'farm') return (_balances as TokenBalanceMode['farm'])?.[addr]?.total || ZERO_BN;
    return (_balances as TokenBalanceMode['silo-deposits'])?.[addr]?.deposited?.amount || ZERO_BN;
  }, [_balances, balancesType]);

  // Toggle the selection state of a token.
  const toggle = useCallback((token: Token) => {
    const copy = new Set(selectedInternal);
    if (selectedInternal.has(token)) {
      copy.delete(token);
      setSelectedInternal(copy);
    } else {
      copy.add(token);
      setSelectedInternal(copy);
    }
  }, [selectedInternal]);

  // Whenever the Dialog opens, store a temporary copy of the currently
  // selected tokens so we can manipulate them quickly here without
  // affecting the form state. User needs to "confirm" the change.
  useEffect(() => {
    if (open) {
      console.debug('[TokenSelectDialog] resetting _selected');
      setSelectedInternal(
        new Set(selected.map(({ token }) => token))
      );
    } else {
      setSelectedInternal(new Set());
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

  if (!selectedInternal) return null;

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
      <StyledDialogTitle id="customized-dialog-title" onClose={handleClose} sx={{ pb: 0.5 }}>
        {title || mode === TokenSelectMode.MULTI ? 'Select Tokens' : 'Select Token'}
      </StyledDialogTitle>
      <StyledDialogContent sx={{ pb: mode === TokenSelectMode.MULTI ? 0 : 1, pt: 0 }}>
        <List sx={{ p: 0 }}>
          <Stack>
            {tokenList ? tokenList.map((_token) => (
              <ListItem
                key={_token.address}
                color="primary"
                selected={selectedInternal.has(_token)}
                disablePadding
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
                  {/* Top-level button stack */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    {/* Icon & text left side */}
                    <Stack direction="row" justifyContent="center" alignItems="center" gap={0}>
                      <ListItemIcon>
                        <img src={_token.logo} alt="" className={classes.tokenLogo} />
                      </ListItemIcon>
                      <ListItemText
                        primary={_token.symbol}
                        secondary={_token.name}
                        sx={{ my: 0 }}
                      />
                    </Stack>
                    {/* Balances right side */}
                    {_balances ? (
                      <Typography variant="bodyLarge">
                        {displayBN(getBalance(_token.address))}
                      </Typography>
                    ) : null}
                  </Stack>
                </ListItemButton>
              </ListItem>
            )) : null}
            {_balances ? (
              <Typography ml={1} pt={0.5} textAlign="center" fontSize={FontSize.sm} color="gray">
                Displaying total Farm and Circulating balances. <Link href="https://docs.bean.money/additional-resources/asset-states" target="_blank" rel="noreferrer" underline="none">Learn more &rarr;</Link>
              </Typography>
            ) : null}
          </Stack>
        </List>
      </StyledDialogContent>
      {mode === TokenSelectMode.MULTI && (
        <StyledDialogActions sx={{ pb: 2 }}>
          <Button
            onClick={onClickSubmit(selectedInternal)}
            disabled={selectedInternal.size === 0}
            variant="outlined"
            fullWidth
            color="primary"
            size="large"
          >
            {selectedInternal.size === 0
              ? 'Select Token to Continue'
              : `Select ${selectedInternal.size} Token${selectedInternal.size === 1 ? '' : 's'}`}
          </Button>
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
});

export default TokenSelectDialog;
