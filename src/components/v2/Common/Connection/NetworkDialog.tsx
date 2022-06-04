import React, { useCallback } from 'react';
import { useNetwork } from 'wagmi';
import { Alert, Button, Dialog, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NETWORK_ERRORS_TO_MESSAGES } from 'constants/connection';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';

const NetworkDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({
  open,
  handleClose
}) => {
  const { chains, error, pendingChainId, switchNetwork } = useNetwork({
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
    <Dialog onClose={handleClose} open={open} fullScreen={isMedium}>
      <StyledDialogTitle onClose={handleClose}>
        Select chain
      </StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={1}>
          {chains.map((chain) => (
            <Button
              variant="outlined"
              color="primary"
              key={chain.id}
              onClick={handleSwitch(chain.id)}
              sx={{
                py: 1,
                minWidth: isMedium ? null : 400,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }} gap={3}>
                <Typography color="text.primary" sx={{ fontSize: 20 }}>
                  {chain.name}
                </Typography>
              </Stack>
            </Button>
          ))}
          {error && (
            <Alert severity="error">
              {NETWORK_ERRORS_TO_MESSAGES[error.name || error.message](pendingChainId) || error.message}
            </Alert>
          )}
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default NetworkDialog;
