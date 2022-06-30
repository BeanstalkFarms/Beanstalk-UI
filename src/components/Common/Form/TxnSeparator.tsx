import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from '@mui/material';

const TxnSeparator : React.FC = () => {
  return (
    <Stack direction="row" justifyContent="center">
      <ExpandMoreIcon color="secondary" />
    </Stack>
  )  
}

export default TxnSeparator;