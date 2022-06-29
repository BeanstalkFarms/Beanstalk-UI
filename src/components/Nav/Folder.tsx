import React, { useState } from 'react';
import { Box, Button, ButtonProps, Drawer, Popper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DropdownIcon from 'components/Common/DropdownIcon';


/**
 * Show a "Folder".
 * 
 * On desktop:
 * - Clicking the Button creates a folder-like Popover. 
 * 
 * On mobile:
 * - Clicking the Button shows a Drawer.
 */
const Folder: React.FC<{
  startIcon?: any;
  buttonContent: JSX.Element;
  popoverContent: JSX.Element;
  drawerContent: JSX.Element;
} & ButtonProps> = ({
  startIcon,
  buttonContent,
  popoverContent,
  drawerContent,
  ...buttonProps
}) => {
  
  // Setup
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Popover
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const popoverOpen = Boolean(anchorEl);
  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  // Handlers
  const onClickButton = isMobile ? handleOpenDrawer : handleOpenPopover;

  return (
    <>
      <Box>
        <Button
          color="light"
          startIcon={startIcon}
          endIcon={<DropdownIcon open={(popoverOpen || drawerOpen)} />}
          onClick={onClickButton}
          disableRipple
          {...buttonProps}
          sx={{
            // Fully rounded by default; when open, remove
            // the bottom rounding to look like a "tab".
            borderBottomLeftRadius:  anchorEl ? 0 : undefined,
            borderBottomRightRadius: anchorEl ? 0 : undefined,  
            // Enforce a default white border; switch the color
            // to secondary when the Popper is open.
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: anchorEl ? 'secondary.main' : 'white',
            // Keep this white so we can make it look like the
            // button is "expanding" into a Box when you click it.
            borderBottomColor: 'white',
            // Without disabling the transition, the border fades
            // in/out and looks weird.
            transition: 'none !important',
            // Move the button above the Box so we can slice off
            // the 1px border at the top of the Box.
            zIndex: anchorEl ? 999 : undefined,
            // Positioning and other styles.
            mr: 1,
            ...buttonProps.sx
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {buttonContent}
          </Typography>
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
              width: '400px',
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
            className="border border-t-0 shadow-xl"
          >
            {popoverContent}
          </Box>
        </Popper>
      </Box>
      {/* Mobile: Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Folder;
