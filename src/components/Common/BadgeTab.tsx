import { Box, Stack, Tab, TabProps } from '@mui/material';
import React from 'react';

const Badge = () => (
  <Box
    className="B-badge"
    sx={{
      opacity: 0.7,
      width: 8,
      height: 8,
      backgroundColor: 'primary.main',
      borderRadius: 4,
    }}
  />
);

const BadgeTab: React.FC<TabProps & { showBadge: boolean }> = ({
  showBadge,
  label,
  sx,
  ...props
}) => (
  <Tab
    label={
      <Stack
        display="inline-flex"
        direction="row"
        alignItems="center"
        gap={0.25}
      >
        {showBadge && <Badge />}
        <span>{label}</span>
      </Stack>
    }
    sx={{
      overflow: 'visible',
      /// Show the badge in full color when selected.
      '&.Mui-selected .B-badge': {
        opacity: 1,
      },
      ...sx,
    }}
    {...props}
  />
);

export default BadgeTab;
