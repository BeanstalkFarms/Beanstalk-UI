import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/styles';

export const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialogContent-root': {},
}));

export interface DialogTitleProps {
  id?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

export const StyledDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, px: 2, py: 1.5 }} {...other}>
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
};

export const StyledDialogContent = DialogContent;
export const StyledDialogActions = DialogActions;
