import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

const PageHeader : React.FC<{
  /** "The Field" */
  title: string;
  /** "The Decentralized Credit Facility" */
  purpose: string;
  /** "Earn yield through lending beans..." */
  description: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => (
  <Stack direction="row" justifyContent="space-between">
    <Stack direction="column" gap={0.5}>
      <Box>
        <Typography variant="h2">
          <span>{props.title}: </span>
          <span style={{ fontWeight: 'normal' }}>{props.purpose}</span>
        </Typography>
      </Box>
      <Box>
        <Typography>{props.description}</Typography>
      </Box>
    </Stack>
    <Box>{props.control}</Box>
  </Stack>
  );

export default PageHeader;
