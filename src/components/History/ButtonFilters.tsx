/* eslint-disable */
import React from 'react';
import {Box, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({}))

const buttonStyle = {
  cursor: "pointer",
  border: 1,
  pl: 1,
  pr: 1,
  pt: 0.5,
  pb: 0.5,
  borderRadius: "25px"
}

export interface ButtonTabsProps {
  title: string;
}

const ButtonFilters: React.FC<ButtonTabsProps> = ({title}) => {
  const classes = useStyles();
  return (
    <Stack direction="row" gap={1}>
      <Box sx={{...buttonStyle}}>
        <Typography>Silo</Typography>
      </Box>
      <Box sx={{...buttonStyle}}>
        <Typography>Field</Typography>
      </Box>
      <Box sx={{...buttonStyle}}>
        <Typography>Other</Typography>
      </Box>
    </Stack>
  );
};

export default ButtonFilters;
