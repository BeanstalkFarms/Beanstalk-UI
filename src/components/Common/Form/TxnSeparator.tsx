import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack, StackProps } from '@mui/material';
import { IconSize } from '../../App/muiTheme';

const TxnSeparator : React.FC<StackProps> = ({ ...props }) => (
  <Stack direction="row" justifyContent="center" {...props}>
    <ExpandMoreIcon color="secondary" width={IconSize.xs} />
  </Stack>
  );

export default TxnSeparator;
