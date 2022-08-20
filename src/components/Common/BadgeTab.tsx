import { Stack, Tab, TabProps } from '@mui/material';
import React from 'react';
import Dot from '~/components/Common/Dot';

const BadgeTab : React.FC<TabProps & { showBadge: boolean }> = ({ showBadge, label, sx, ...props }) => (
  <Tab
    label={(
      <Stack display="inline-flex" direction="row" alignItems="center" gap={0.25}>
        {showBadge && <Dot color="primary.main" className="B-badge" sx={{ opacity: 0.7 }} />}
        <span>{label}</span>
      </Stack>
    )}
    sx={{
      overflow: 'visible',
      /// Show the badge in full color when selected.
      '&.Mui-selected .B-badge': {
        opacity: 1,
      },
      ...sx
    }}
    {...props}
  />
);

export default BadgeTab;
