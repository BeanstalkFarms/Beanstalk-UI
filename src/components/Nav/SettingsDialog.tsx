import { Box, Typography } from '@mui/material';
import React from 'react';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';

const SettingsDialog : React.FC<{ open: boolean; onClose?: () => void; }> = ({ open, onClose }) => (
  <StyledDialog open={open} onClose={onClose}>
    <StyledDialogTitle onClose={onClose}>Settings</StyledDialogTitle>
    <StyledDialogContent sx={{ px: 2, pb: 1 }}>
      <Box />
      <Box sx={{ px: 1, pt: 2, opacity: 0.7 }}>
        <Typography color="text.secondary" fontSize={12} textAlign="center">
          {import.meta.env.VITE_NAME || 'beanstalk-ui'} v
          {import.meta.env.VITE_VERSION || '0.0.0'}@
          {import.meta.env.VITE_GIT_COMMIT_REF?.slice(0, 6) || 'HEAD'}
          {' · '}
          hosted on {import.meta.env.VITE_HOST || 'unknown'}
        </Typography>
      </Box>
    </StyledDialogContent>
  </StyledDialog>
);

export default SettingsDialog;
