import React from 'react';
import { useNetwork } from 'wagmi';
import { Button, ButtonProps, Typography } from '@mui/material';
import { SupportedChainId } from 'constants/chains';
import { ETH } from 'constants/tokens';
import useAnchor from 'hooks/display/useAnchor';
import TokenIcon from '../TokenIcon';
import DropdownIcon from '../DropdownIcon';
import NetworkDialog from './NetworkDialog';

const NetworkButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { activeChain } = useNetwork();

  // Dialog
  const [anchor, toggleAnchor] = useAnchor();
  const open = Boolean(anchor);
  
  if (!activeChain) return null;

  const startIcon = SupportedChainId[activeChain.id] ? (
    <TokenIcon
      token={ETH[SupportedChainId.MAINNET]}
      // Want this icon bigger than surrounding text
      style={{ height: '1.4em' }}
    />
  ) : (
    <TokenIcon
      token={ETH[SupportedChainId.MAINNET]}
      // Want this icon bigger than surrounding text
      style={{ height: '1.4em' }}
    />
  );
  const text = SupportedChainId[activeChain.id] ? (
    activeChain.name
  ) : (
    'Switch Network'
  );

  return (
    <>
      <Button
        disableFocusRipple
        variant="contained"
        color="light"
        startIcon={startIcon}
        endIcon={<DropdownIcon open={open} />}
        onClick={toggleAnchor}
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
        <Typography variant="bodyMedium" sx={{ display: { md: 'block', xs: 'none' } }}>
          {text}
        </Typography>
      </Button>
      <NetworkDialog
        open={open}
        // toggling always removes the anchor when open === true
        handleClose={toggleAnchor}
      />
    </>
  );
};

export default NetworkButton;
