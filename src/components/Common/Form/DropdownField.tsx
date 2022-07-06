import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { BeanstalkPalette } from '../../App/muiTheme';
import OutputField from './OutputField';

const DropdownField : React.FC<{
  buttonText: string;
  handleOpenDialog: any;
}> = ({
  buttonText,
  handleOpenDialog
}) => (
  <OutputField justifyContent="end">
    <Button
      onClick={handleOpenDialog}
      sx={{
        px: 0.5,
        color: BeanstalkPalette.black,
        backgroundColor: 'transparent',
        '&:hover' : {
          backgroundColor: 'transparent',
        },
    }}
    >
      <Stack direction="row" gap={0.1} alignItems="center" onClick={handleOpenDialog} sx={{ cursor: 'pointer' }}>
        <Typography>{buttonText}</Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </Stack>
    </Button>
  </OutputField>
);

export default DropdownField;
