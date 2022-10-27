import React, { useCallback } from 'react';
import {
  Connector,
  useAccount as useWagmiAccount,
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
import { CONNECT_WALLET_ERRORS, CONNECTOR_LOGOS } from '~/constants/wallets';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';
import Row from '~/components/Common/Row';

// -----------------------------------------------------------------

import { FC } from '~/types';
import { BeanstalkPalette } from '~/components/App/muiTheme';

const WalletDialog: FC<{
  handleClose: () => void;
  open: boolean;
  fullScreen: boolean;
}> = ({ handleClose, open, fullScreen }) => {
  const { isConnecting } = useWagmiAccount();
  const { connect, connectors, error, pendingConnector } =
    useConnect({
      onSuccess() {
        handleClose();
      }
  });
  const handleConnect = useCallback(
    (connector: Connector) => () => connect({ connector }),
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
            connector.ready ? (
              <Button
                size="large"
                variant="outlined"
                color="primary"
                key={connector.id}
                disabled={!connector.ready}
                onClick={handleConnect(connector)}
                sx={{
                  backgroundColor: BeanstalkPalette.theme.fallDark.light,
                  py: 1,
                  minWidth: fullScreen ? null : 400,
                  borderColor: 'divider'
                  // borderColor: grey[300]
                }}
              >
                <Row justifyContent="space-between" sx={{ width: '100%' }} gap={3}>
                  <Typography color="text.primary" sx={{ fontSize: 20 }}>
                    {isConnecting && (connector.id === pendingConnector?.id)
                      ? <CircularProgress variant="indeterminate" color="primary" size={20} />
                      : connector.name}
                  </Typography>
                  {CONNECTOR_LOGOS[connector.name] && (
                    <img
                      src={CONNECTOR_LOGOS[connector.name]}
                      alt=""
                      css={{ height: 35 }}
                    />
                  )}
                </Row>
              </Button>
            ) : null
          ))}
          {error && (
            <Alert severity="error">
              {CONNECT_WALLET_ERRORS[error.name || error.message]?.(pendingConnector) || `Error: ${error.message}`}
            </Alert>
          )}
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default WalletDialog;
