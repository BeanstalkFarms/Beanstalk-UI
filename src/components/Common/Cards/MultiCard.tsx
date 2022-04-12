import React from 'react';
import classNames from 'classnames';
import makeStyles from '@mui/styles/makeStyles';
import { Card, CardProps } from '@mui/material';

import { theme } from 'constants/index';

const useStyles = makeStyles(() => ({
  // Card Root
  // NOTE: for backwards compatibility we enforce that
  // `MultiCard` always take up the full width of its container.
  root: {
    width: '100%',
    borderRadius: '25px',
  },
  // "Input" cards (off-white background)
  input: {
    backgroundColor: theme.module.background,
    color: theme.text,
    // FIXME
    padding: '10px',
  },
  // "Meta" cards (partially transparent beige background)
  meta: {
    backgroundColor: theme.module.metaBackground,
    color: theme.backgroundText,
    // FIXME
    padding: '10px 16px 30px 16px',
    marginTop: '16px',
  },
  // "Foreground" (pure white)
  foreground: {
    backgroundColor: theme.module.foreground,
    color: theme.text,
    // FIXME
    padding: '10px',
  }
}));

const defaultElevation = {
  meta: 0,
  input: 7,
  foreground: 0,
};

type MultiCardType = 'meta' | 'input' | 'foreground';

const MultiCard : React.FC<CardProps & { type: MultiCardType }> = ({ children, type, elevation, ...props }) => {
  const classes = useStyles();
  return (
    <Card
      elevation={elevation || defaultElevation[type]}
      className={classNames(classes.root, classes[type])}
      {...props}
    >
      {children}
    </Card>
  );
};

export default MultiCard;
