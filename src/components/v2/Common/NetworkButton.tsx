import React, { useCallback, useState } from 'react';
import { useNetwork } from 'wagmi';
import { Button, ButtonProps, Dialog, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SupportedChainId } from 'constants/chains';
import { ETH } from 'constants/tokens';
import TokenIcon from './TokenIcon';
import DropdownIcon from './DropdownIcon';
import { StyledDialogContent } from './Dialog';

const NetworkButton: React.FC<ButtonProps> = ({ ...props }) => {
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

  // 
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // Network Dialog
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
      {/* Button */}
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
          {...props}
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
            },
            ...props.sx
          }}
        >
          <Typography variant="subtitle1" sx={{ display: { md: 'block', xs: 'none' } }}>
            {activeChain?.name}
          </Typography>
        </Button>
      )}
      {/* Dialog */}
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
    </>
  );
};

export default NetworkButton;
