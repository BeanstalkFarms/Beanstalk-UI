import React from 'react';
import { Button, ButtonProps, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import Row from '~/components/Common/Row';

const AdvancedButton : React.FC<{ 
  open: boolean;
} & ButtonProps> = ({
  open,
  ...props
}) => (
  /// FIXME: make a MUI button variant for this
  <Button
    variant="contained"
    color="light"
    sx={{ backgroundColor: '#F6FAFE' }}
    size="small"
    {...props}
  >
    <Row gap={0.5}>
      <Typography fontSize="bodySmall">Advanced</Typography>
      <DropdownIcon
        open={open}
        sx={{ fontSize: 18 }}
        mode="right-rotate"
      />
    </Row>
  </Button>
);

export default AdvancedButton;
