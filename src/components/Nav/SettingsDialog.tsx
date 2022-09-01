import { Box, Button, ButtonGroup, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FontSize } from '~/components/App/muiTheme';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import Row from '~/components/Common/Row';
import { SGEnvironments, BEANSTALK_SUBGRAPH_ENDPOINTS } from '~/graph/endpoints';
import useSetting from '~/hooks/app/useSetting';
import { save } from '~/state';
import { setNextSunrise, setRemainingUntilSunrise } from '~/state/beanstalk/sun/actions';
import { clearApolloCache } from '~/util';

const Split : React.FC = ({ children }) => (
  <Row justifyContent="space-between" gap={1}>
    {children}
  </Row>
);

const buttonStyle = {
  variant: 'outlined' as const,
  color: 'dark' as const,
  size: 'small' as const,
  sx: { fontWeight: 400 },
  disableElevation: true,
};

const buttonProps = <T extends any>(curr: T, set: (v: any) => void, v: T) => {
  if (curr === v) {
    return {
      color: 'primary' as const,
      onClick: undefined,
    };
  }
  return {
    onClick: () => set(v),
  };
};

const SelectInputProps = {
  sx: {
    py: 0.5,
    fontSize: FontSize.base
  }
};

const SettingsDialog : React.FC<{ open: boolean; onClose?: () => void; }> = ({ open, onClose }) => {
  const [denomination, setDenomination] = useSetting('denomination');
  const [subgraphEnv, setSubgraphEnv]   = useSetting('subgraphEnv');
  const dispatch = useDispatch();

  /// Cache
  const clearCache = useCallback(() => {
    clearApolloCache();
  }, []);
  const updateSubgraphEnv = useCallback((env: SGEnvironments) => {
    setSubgraphEnv(env);
    save();
    clearApolloCache();
  }, [setSubgraphEnv]);

  /// Dev Controls
  const setSeasonTimer = useCallback(() => {
    const _next = DateTime.now().plus({ second: 5 });
    dispatch(setNextSunrise(_next));
    dispatch(setRemainingUntilSunrise(_next.diffNow()));
  }, [dispatch]);

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle onClose={onClose}>Settings</StyledDialogTitle>
      <StyledDialogContent sx={{ px: 2, pb: 2 }}>
        <Stack gap={2}>
          <Stack gap={1}>
            <Split>
              <Typography color="gray">Fiat display</Typography>
              {/* @ts-ignore */}
              <ButtonGroup variant="outlined" color="dark" disableRipple>
                <Button {...buttonStyle} {...buttonProps(denomination, setDenomination, 'usd')}>{denomination === 'usd' ? '✓ ' : undefined}USD</Button>
                <Button {...buttonStyle} {...buttonProps(denomination, setDenomination, 'bdv')}>{denomination === 'bdv' ? '✓ ' : undefined}BDV</Button>
              </ButtonGroup>
            </Split>
            <Split>
              <Typography color="gray">Subgraph</Typography>
              <Box>
                <Select
                  value={subgraphEnv || SGEnvironments.BF_PROD}
                  size="small"
                  onChange={(e) => updateSubgraphEnv(e.target.value as SGEnvironments)}
                  inputProps={SelectInputProps}
                >
                  {Object.values(SGEnvironments).map((value) => (
                    <MenuItem key={value} value={value}>
                      {BEANSTALK_SUBGRAPH_ENDPOINTS[value as SGEnvironments]?.name || 'Unknown'}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Split>
            <Split>
              <Typography color="gray">Clear cache</Typography>
              <Button {...buttonStyle} onClick={clearCache}>
                Clear
              </Button>
            </Split>
          </Stack>
          <Stack gap={1}>
            <Typography variant="h4">Info</Typography>
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
          {import.meta.env.DEV ? (
            <Stack gap={1}>
              <Typography variant="h4">Dev Controls</Typography>
              <Split>
                <Typography color="gray">Set season timer</Typography>
                <Button {...buttonStyle} onClick={setSeasonTimer}>in 5s</Button>
              </Split>
            </Stack>
          ) : null}
        </Stack>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default SettingsDialog;
