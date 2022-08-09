import { Box, Button, ButtonGroup, Stack, Typography } from '@mui/material';
import React from 'react';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import useSetting from '~/hooks/useSetting';

const Split : React.FC = ({ children }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    {children}
  </Stack>
);

const buttonProps = <T extends any>(curr: T, set: (v: any) => void, v: T) => {
  if (curr === v) {
    return {
      color: 'primary' as const,
      // variant: 'contained' as const,
      disableElevation: true,
      onClick: undefined,
      sx: { fontWeight: 400 }
    };
  }
  return {
    onClick: () => set(v),
    sx: { fontWeight: 400 }
  };
};

const SettingsDialog : React.FC<{ open: boolean; onClose?: () => void; }> = ({ open, onClose }) => {
  const [denomination, setDenomination] = useSetting('denomination');
  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle onClose={onClose}>Settings</StyledDialogTitle>
      <StyledDialogContent sx={{ px: 2, pb: 2 }}>
        <Stack gap={2}>
          <Box>
            <Split>
              <Typography color="gray">Fiat display</Typography>
              {/* @ts-ignore */}
              <ButtonGroup variant="outlined" color="dark" disableRipple>
                <Button {...buttonProps(denomination, setDenomination, 'usd')}>{denomination === 'usd' ? '✓ ' : undefined}USD</Button>
                <Button {...buttonProps(denomination, setDenomination, 'bdv')}>{denomination === 'bdv' ? '✓ ' : undefined}BDV</Button>
              </ButtonGroup>
            </Split>
          </Box>
          <Stack gap={1}>
            <Typography variant="h4">Info</Typography>
            <Stack gap={1}>
              <Split>
                <Typography color="gray">Version</Typography>
                <Box>{import.meta.env.VITE_VERSION || '0.0.0'}</Box>
              </Split>
              <Split>
                <Typography color="gray">Commit</Typography>
                <Box>{import.meta.env.VITE_GIT_COMMIT_REF?.slice(0, 6) || 'HEAD'}</Box>
              </Split>
              <Split>
                <Typography color="gray">Host</Typography>
                <Box>{import.meta.env.VITE_HOST || 'unknown'}</Box>
              </Split>
            </Stack>
          </Stack>
        </Stack>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default SettingsDialog;
