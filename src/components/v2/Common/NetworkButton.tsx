import React, { useCallback, useState } from 'react';
import { useNetwork } from 'wagmi';
import { Box, Button, Dialog, Stack, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ethIcon from 'img/eth-logo.svg';
import { SupportedChainId } from 'constants/chains';
import TokenIcon from './TokenIcon';
import DropdownIcon from './DropdownIcon';
import { ETH } from 'constants/v2/tokens';

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
          startIcon={<TokenIcon token={ETH[SupportedChainId.MAINNET]} style={{ height: '1.4em' }} />}
          endIcon={<DropdownIcon open={open} />}
          onClick={handleClick}
        >
          <Typography variant="subtitle1">{activeChain?.name}</Typography>
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
