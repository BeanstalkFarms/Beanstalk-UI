import { Box, Button, ButtonProps, Stack, Typography } from '@mui/material';
import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { BeanstalkPalette } from '../../App/muiTheme';

const DropdownField : React.FC<{
  buttonText: string;
  handleOpenDialog: any;
}> = ({
  buttonText,
  handleOpenDialog
}) => (
  <Stack
    sx={{
        backgroundColor: '#F6FAFE',
        borderRadius: 1,
        px: 2,
        py: 2,
        color: 'inherit',
      }}
    direction="row"
    alignItems="center"
    justifyContent="end"
  >
    <Button
      onClick={handleOpenDialog}
      sx={{
        color: BeanstalkPalette.black,
        backgroundColor: 'transparent',
        '&:hover' : {
          backgroundColor: 'transparent',
        }
    }}
    >
      <Stack direction="row" gap={0.1} alignItems="center" onClick={handleOpenDialog} sx={{ cursor: 'pointer' }}>
        <Typography>{buttonText}</Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </Stack>
    </Button>
  </Stack>
  );

export default DropdownField;
