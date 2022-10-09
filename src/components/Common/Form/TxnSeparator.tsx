import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StackProps } from '@mui/material';
import { IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const TxnSeparator : FC<StackProps> = ({ ...props }) => (
  <Row justifyContent="center" {...props}>
    <ExpandMoreIcon color="secondary" width={IconSize.xs} />
  </Row>
);

export default TxnSeparator;
