import React, { useCallback } from 'react';
import {
  Connector,
  useConnect,
} from 'wagmi';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { CONNECT_WALLET_ERRORS, CONNECTOR_LOGOS } from 'constants/wallets';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';

// -----------------------------------------------------------------

const WalletDialog: React.FC<{
  handleClose: () => void;
  open: boolean;
  fullScreen: boolean;
}> = ({ handleClose, open, fullScreen }) => {
  const { connect, connectors, error, isConnecting, pendingConnector } =
    useConnect({
      onConnect() {
        handleClose();
      }
  });
  const handleConnect = useCallback(
    (connector: Connector) => () => connect(connector),
    [connect]
  );
  return (
    <Dialog onClose={handleClose} open={open} fullScreen={fullScreen}>
      <StyledDialogTitle onClose={handleClose}>
        Connect a wallet
      </StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={1}>
          {connectors.map((connector) => (
            <Button
              variant="outlined"
              color="primary"
              key={connector.id}
              disabled={!connector.ready}
              onClick={handleConnect(connector)}
              sx={{
                py: 1,
                minWidth: fullScreen ? null : 400,
                borderColor: grey[300]
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }} gap={3}>
                <Typography color="text.primary" sx={{ fontSize: 20 }}>
                  {isConnecting && (connector.id === pendingConnector?.id)
                    ? <CircularProgress variant="indeterminate" color="primary" size={20} />
                    : connector.name}
                </Typography>
                {CONNECTOR_LOGOS[connector.name] && (
                  <img src={CONNECTOR_LOGOS[connector.name]} alt="" style={{ height: 35 }} />
                )}
              </Stack>
            </Button>
          ))}
          {error && (
            <Alert severity="error">
              {CONNECT_WALLET_ERRORS[error.name || error.message](pendingConnector) || error.message}
            </Alert>
          )}
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default WalletDialog;
