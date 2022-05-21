import React, { useCallback, useState } from 'react';
import { useNetwork } from 'wagmi';
import { Box, Button, Dialog, Stack } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ethIcon from 'img/eth-logo.svg';

const NetworkButton : React.FC = () => {
  const { activeChain, chains, error, isLoading, pendingChainId, switchNetwork } = useNetwork();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSwitch = useCallback((id) => {
    return () => {
      if(switchNetwork) {
        switchNetwork(id);
        handleClose();
      }
    }
  }, [switchNetwork]);
  
  return (
    <>
      {activeChain && (
        <Button
          variant="contained"
          color="light"
          startIcon={<img src={ethIcon} alt="Bean" style={{ height: 25 }} />}
          endIcon={<ArrowDropDownIcon />}
          onClick={handleClick}
        >
          {activeChain?.name}
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
                {chain.name}
              </Button>
            ))}
          </Stack>
          {error && <div>{error.message}</div>}
        </Box>
      </Dialog>
    </>
  )
}

export default NetworkButton;