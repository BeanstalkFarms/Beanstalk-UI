import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import React from 'react';
import { IconSize } from '../App/muiTheme';

const PageHeader : React.FC<{
  /** The Field: The Decentralized Credit Facility */
  title?: string | JSX.Element;
  /** "Earn yield through lending beans..." */
  description?: string;
  /** Show a back button to return to `returnPath`. */
  returnPath?: string;
  /**  */
  control?: React.ReactElement;
}> = (props) => (
  <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" gap={1}>
    <Stack direction="column" alignItems="start" gap={1.5}>
      {props.returnPath && (
        <Button
          to={props.returnPath}
          component={RouterLink}
          variant="contained"
          color="light"
          sx={{ p: 1, borderRadius: 1 }}
        >
          <Stack direction="row" gap={0.5} alignItems="center">
            <KeyboardBackspaceIcon sx={{ width: IconSize.small }} height="auto" />
            <Typography variant="h4">Back</Typography>
          </Stack>
        </Button>
      )}

      {/* --- THE OLD CIRCLE BACK BUTTON ---*/}
      {/* {props.returnPath && ( */}
      {/*  <Button */}
      {/*    to={props.returnPath} */}
      {/*    component={RouterLink} */}
      {/*    variant="contained" */}
      {/*    color="light" */}
      {/*    sx={{ p: 1, borderRadius: 100, minWidth: 0 }} */}
      {/*  > */}
      {/*    <ChevronLeftIcon /> */}
      {/*  </Button> */}
      {/* )} */}

      <Stack direction="column" gap={0}>
        {props.title && (
          <Box>
            <Typography variant="h1">
              {props.title}
            </Typography>
          </Box>
        )}
        {props.description && (
          <Box>
            <Typography
              variant="subtitle1">
              {props.description}
            </Typography>
          </Box>
        )}
      </Stack>
    </Stack>
    {props.control && <Box>{props.control}</Box>}
  </Stack>
  );

export default PageHeader;
