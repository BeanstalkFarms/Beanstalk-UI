import React, { useCallback, useState } from 'react';
import { useNetwork } from 'wagmi';
import { Button, ButtonProps, Dialog, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SupportedChainId } from 'constants/chains';
import { ETH } from 'constants/tokens';
import TokenIcon from '../TokenIcon';
import DropdownIcon from '../DropdownIcon';
import { StyledDialogContent } from '../Dialog';
import NetworkDialog from './NetworkDialog';

const NetworkButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { activeChain } = useNetwork();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return activeChain ? (
    <>
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
      <NetworkDialog
        open={open}
        handleClose={handleClose}
      />
    </>
  ) : null;
};

export default NetworkButton;
