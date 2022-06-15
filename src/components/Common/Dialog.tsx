import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack, DialogTitleProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/styles';

export const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialogContent-root': {},
}));

export const StyledDialogTitle : React.FC<{
  id?: string;
  children?: React.ReactNode;
  onClose?: () => void;
} & DialogTitleProps> = ({ children, onClose, sx, ...props }) => (
  <DialogTitle sx={{ m: 0, px: 2, py: 1.5, ...sx }} {...props}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </Stack>
  </DialogTitle>
);

export const StyledDialogContent = DialogContent;
export const StyledDialogActions = DialogActions;
