import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Drawer,
  Popper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DropdownIcon from 'components/Common/DropdownIcon';
import useToggle from 'hooks/display/useToggle';
import useAnchor from 'hooks/display/useAnchor';

/**
 * Show a "Folder". A folder is a button that shows a popup;
 * the type of popup varies depending on the screen size.
 *
 * On desktop: Clicking the Button creates a folder-like Popover.
 *             The Popover is designed to look like it "expands"
 *             out of the button. See <PriceButton/> for example.
 * On mobile:  Clicking the Button shows a Drawer.
 */
const FolderMenu: React.FC<
  {
    startIcon?: any;
    buttonContent: JSX.Element;
    popoverContent: JSX.Element;
    drawerContent: JSX.Element;
    hideTextOnMobile?: boolean;
  } & ButtonProps
> = ({
  startIcon,
  buttonContent,
  popoverContent,
  drawerContent,
  hideTextOnMobile,
  ...buttonProps
}) => {
  // Setup
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Popover
  const [anchorEl, toggleAnchor] = useAnchor();
  const popoverOpen = Boolean(anchorEl);

  // Drawer
  const [drawerOpen, openDrawer, closeDrawer] = useToggle();

  // Handlers
  const onClickButton = isMobile ? openDrawer : toggleAnchor;

  return (
    <>
      {/* Mobile: Drawer */}
      <Drawer anchor="bottom" open={drawerOpen} onClose={closeDrawer}>
        {drawerContent}
      </Drawer>
      <Box>
        <Button
          color="light"
          startIcon={startIcon}
          endIcon={<DropdownIcon open={popoverOpen || drawerOpen} />}
          onClick={onClickButton}
          disableRipple
          {...buttonProps}
          sx={{
            // Fully rounded by default; when open, remove
            // the bottom rounding to look like a "tab".
            borderBottomLeftRadius: popoverOpen ? 0 : undefined,
            borderBottomRightRadius: popoverOpen ? 0 : undefined,
            // Enforce a default white border; switch the color
            // to secondary when the Popper is open.
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: popoverOpen ? 'secondary.main' : 'white',
            // Keep this white so we can make it look like the
            // button is "expanding" into a Box when you click it.
            borderBottomColor: 'white',
            // Without disabling the transition, the border fades
            // in/out and looks weird.
            transition: 'none !important',
            // Move the button above the Box so we can slice off
            // the 1px border at the top of the Box.
            zIndex: popoverOpen ? 999 : undefined,
            // Positioning and other styles.
            mr: 1,
            ...buttonProps.sx,
          }}
        >
          <Box
            sx={{
              display: { xs: hideTextOnMobile ? 'none' : 'block', sm: 'block' },
            }}
          >
            <Typography variant="h3">{buttonContent}</Typography>
          </Box>
        </Button>
        <Popper
          open={popoverOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          disablePortal
        >
          <Box
            sx={(_theme) => ({
              background: 'white',
              width: '450px',
              borderBottomLeftRadius: _theme.shape.borderRadius,
              borderBottomRightRadius: _theme.shape.borderRadius,
              borderTopRightRadius: _theme.shape.borderRadius,
              borderColor: 'secondary.main',
              borderWidth: 1,
              borderStyle: 'solid',
              px: 1,
              py: 1,
              boxShadow: _theme.shadows[0],
              // Should be below the zIndex of the Button.
              zIndex: 998,
              mt: '-1px',
            })}
          >
            {popoverContent}
          </Box>
        </Popper>
      </Box>
    </>
  );
};

export default FolderMenu;
