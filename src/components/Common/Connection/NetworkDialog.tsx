import React, { useCallback } from 'react';
import { useNetwork } from 'wagmi';
import { Alert, Button, Dialog, Stack, Typography, useMediaQuery } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { SWITCH_NETWORK_ERRORS } from 'constants/wallets';
import { SupportedChainId } from 'constants/chains';
import { ETH } from 'constants/tokens';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';

const chainImgMap : { [key: string] : string | undefined } = {
  Ethereum: ETH[SupportedChainId.MAINNET].logo,
  Ropsten:  ETH[SupportedChainId.ROPSTEN].logo
};

const NetworkDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({
  open,
  handleClose
}) => {
  const { activeChain, chains, error, pendingChainId, switchNetwork } = useNetwork({
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
  const handleSwitch = useCallback(
    (id) => () => {
      if (switchNetwork) {
        console.debug(`[NetworkButton] switching network => ${id}`);
        switchNetwork(id);
        handleClose();
      }
    },
    [switchNetwork, handleClose]
  );
  // 
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog onClose={handleClose} open={open} disableScrollLock>
      <StyledDialogTitle onClose={handleClose}>
        Select chain
      </StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={1}>
          {activeChain?.id && !SupportedChainId[activeChain.id] ? (
            <Alert severity="info">
              {activeChain.name} is not supported. Please select another network below.
            </Alert>
          ) : null}
          {chains.map((chain) => (
            <Button
              variant="outlined"
              color="primary"
              key={chain.id}
              onClick={handleSwitch(chain.id)}
              sx={{
                py: 1,
                minWidth: isMedium ? null : 400,
                borderColor: grey[300]
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }} gap={3}>
                <Typography color="text.primary" sx={{ fontSize: 20 }}>
                  {chain.name}
                </Typography>
                <img src={chainImgMap[chain.name]} alt="" style={{ height: 35 }} />
              </Stack>
            </Button>
          ))}
          {error && (
            <Alert severity="error">
              {SWITCH_NETWORK_ERRORS[error.name || error.message](pendingChainId) || error.message}
            </Alert>
          )}
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default NetworkDialog;
