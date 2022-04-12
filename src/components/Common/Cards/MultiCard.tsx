import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Card, CardProps } from '@mui/material';

import { theme } from 'constants/index';

const useStyles = makeStyles(() => ({
  input: {
    backgroundColor: theme.module.background,
    borderRadius: '25px',
    color: theme.text,
    padding: '10px',
  },
  meta: {
    backgroundColor: theme.module.metaBackground,
    color: theme.backgroundText,
    // FIXME
    borderRadius: '25px',
    boxShadow: 'none',
    marginTop: '16px',
    padding: '10px 16px 30px 16px',
  },
}));

type CardType = "meta" | "input";

const MultiCard : React.FC<CardProps & { type: CardType }> = ({ children, type, ...props }) => {
  const classes = useStyles();
  return (
    <Card elevation={7} className={classes[type]} {...props}>
      {children}
    </Card>
  )
}

export default MultiCard;