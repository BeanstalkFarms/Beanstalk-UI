import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack, DialogTitleProps, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { styled } from '@mui/styles';

export const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialogContent-root': {},
}));

export const StyledDialogTitle : React.FC<{
  id?: string;
  children?: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
} & DialogTitleProps> = ({
  children,
  onBack,
  onClose,
  sx,
  ...props
}) => (
  <DialogTitle
    sx={{
      m: 0,
      // px: 2,
      pl: onBack ? 1 : 2,
      pr: onClose ? 1 : 2,
      py: 1.5,
      ...sx
    }}
    {...props}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {onBack ? (
        <IconButton
          aria-label="close"
          onClick={onBack}
          sx={{
            color: (theme) => theme.palette.grey[900],
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ) : null}
      <Typography variant="h3">
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[900],
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ) : null}
    </Stack>
  </DialogTitle>
);

export const StyledDialogContent = DialogContent;
export const StyledDialogActions = DialogActions;
