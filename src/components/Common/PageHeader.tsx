import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import React from 'react';

const PageHeader : React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title: string | JSX.Element;
  /** "Earn yield through lending beans..." */
  description: string;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => (
  <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" gap={1}>
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
      <Stack direction="column" gap={0}>
        <Box>
          <Typography
            variant="h1"
            fontWeight="fontWeightBold"
          >
            {props.title}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle1">
            {props.description}
          </Typography>
        </Box>
      </Stack>
    </Stack>
    {props.control && <Box>{props.control}</Box>}
  </Stack>
  );

export default PageHeader;
