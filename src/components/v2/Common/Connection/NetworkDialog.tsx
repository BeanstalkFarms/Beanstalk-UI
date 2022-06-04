import React, { useCallback } from 'react';
import { useNetwork } from 'wagmi';
import { Button, Dialog, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledDialogContent } from './Dialog';

const NetworkDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({
  open,
  handleClose
}) => {
  const { chains, error, switchNetwork } = useNetwork({
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
    [switchNetwork]
  );

  // 
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog onClose={handleClose} open={open} fullScreen={isMedium}>
      <StyledDialogContent>
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
      </StyledDialogContent>
    </Dialog>
  );
};

export default NetworkDialog;
