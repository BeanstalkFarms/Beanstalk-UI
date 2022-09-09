import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, DialogTitleProps, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { styled } from '@mui/styles';
import { FontSize, IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

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
      pl: 2,
      pr: 2,
      pt: 2,
      pb: 1,
      ...sx
    }}
    {...props}
  >
    <Row justifyContent="space-between">
      {onBack ? (
        <IconButton
          aria-label="close"
          onClick={onBack}
          sx={{
            color: (theme) => theme.palette.grey[900],
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: IconSize.small }} />
        </IconButton>
      ) : null}
      <Typography variant="h4" fontWeight="fontWeightBold">
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          disableRipple
          sx={{
            color: (theme) => theme.palette.grey[900],
            p: 0
          }}
        >
          <CloseIcon sx={{ fontSize: FontSize.base }} />
        </IconButton>
      ) : null}
    </Row>
  </DialogTitle>
);

export const StyledDialogContent = DialogContent;
export const StyledDialogActions = DialogActions;
