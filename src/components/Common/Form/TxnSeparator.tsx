import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack, StackProps } from '@mui/material';

const TxnSeparator : React.FC<StackProps> = ({ ...props }) => {
  return (
    <Stack direction="row" justifyContent="center" {...props}>
      <ExpandMoreIcon color="secondary" />
    </Stack>
  )  
}

export default TxnSeparator;