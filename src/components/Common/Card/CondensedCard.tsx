import React from 'react';
import { Card, CardProps, Typography } from '@mui/material';
import { FC } from '~/types';
import Row from '../Row';

type ICondensedCard = {
  title: string;
  actions?: React.ReactNode;
};

/**
 * designed to be used in context of the condensed MUI theme
 */
const CondensedCard: FC<ICondensedCard & CardProps> = ({
  children,
  title,
  actions,
  ...cardProps
}) => (
  <Card {...cardProps}>
    <Row justifyContent="space-between" p={1}>
      <Typography variant="headerSmall" p={0.5}>
        {title}
      </Typography>
      {actions}
    </Row>
    {children}
  </Card>
);

export default CondensedCard;
