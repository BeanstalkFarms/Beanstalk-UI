import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import React from 'react';

const PageHeader : React.FC<{
  /** "The Field" */
  title: string;
  /** "The Decentralized Credit Facility" */
  purpose?: string;
  /** "Earn yield through lending beans..." */
  description: string;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => (
  <Stack direction="row" justifyContent="space-between">
    <Stack direction="row" alignItems="center" gap={1.5}>
      {props.returnPath && (
        <Button
          to={props.returnPath}
          component={RouterLink}
          variant="contained"
          color="light"
          sx={{ p: 1, borderRadius: 100, minWidth: 0 }}
        >
          <ChevronLeftIcon />
        </Button>
      )}
      <Stack direction="column" gap={0.5}>
        <Box>
          <Typography variant="h1">
            <span>{props.title}{props.purpose && <>:&nbsp;</>}</span>
            {props.purpose && <span style={{ fontWeight: 'normal' }}>{props.purpose}</span>}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">{props.description}</Typography>
        </Box>
      </Stack>
    </Stack>
    {props.control && <Box>{props.control}</Box>}
  </Stack>
  );

export default PageHeader;
