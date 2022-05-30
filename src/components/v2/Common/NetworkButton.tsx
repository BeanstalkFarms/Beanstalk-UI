import React, { useCallback, useState } from 'react';
import { useNetwork } from 'wagmi';
import { Box, Button, Dialog, Stack, Typography } from '@mui/material';
import { SupportedChainId } from 'constants/chains';
import { ETH } from 'constants/v2/tokens';
import TokenIcon from './TokenIcon';
import DropdownIcon from './DropdownIcon';

const NetworkButton: React.FC = () => {
  const { activeChain, chains, error, switchNetwork } = useNetwork({
    onSettled(data, err) {
      if (!err) {
        console.debug('[NetworkButton] settled network change...');
        console.debug('');
        console.debug('');
        console.debug('');
        // window.location.reload();
      }
    }
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSwitch = useCallback(
    (id) => () => {
      if (switchNetwork) {
        console.debug(`[NetworkButton] switching network => ${id}`);
        switchNetwork(id);
        handleClose();
      }
    },
    [switchNetwork]
  );

  return (
    <>
      {activeChain && (
        <Button
          disableFocusRipple
          variant="contained"
          color="light"
          startIcon={(
            <TokenIcon
              token={ETH[SupportedChainId.MAINNET]}
              // Want this icon bigger than surrounding text
              style={{ height: '1.4em' }}
            />
          )}
          endIcon={<DropdownIcon open={open} />}
          onClick={handleClick}
          sx={{
            // MUI adds a default margin to start and
            // end icons to give them space between text.
            // When we hide the text below, we also remove the
            // margin so the network icon appears closer to the
            // dropdown icon.
            px: {
              // md: 1.5,    // FIXME: couldn't get 'inherit' to work here
              // xs: 0,
            },
            '& .MuiButton-startIcon': {
              marginRight: { 
                md: 0.8,  // FIXME: couldn't get 'inherit' to work here
                xs: 0
              }
            }
          }}
        >
          <Typography variant="subtitle1" sx={{ display: { md: 'block', xs: 'none' } }}>
            {activeChain?.name}
          </Typography>
        </Button>
      )}
      <Dialog onClose={handleClose} open={open}>
        <Box sx={{ p: 2, minWidth: 340 }}>
          <Stack gap={1}>
            {chains.map((chain) => (
              <Button
                key={chain.id}
                variant="contained"
                color="secondary"
                onClick={handleSwitch(chain.id)}
              >
                <Typography variant="subtitle1">{chain.name}</Typography>
              </Button>
            ))}
          </Stack>
          {error && <div>{error.message}</div>}
        </Box>
      </Dialog>
    </>
  );
};

export default NetworkButton;
