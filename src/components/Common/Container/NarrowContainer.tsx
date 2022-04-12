import React from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    margin: '0 auto',
    maxWidth: '500px',
  }
});

/**
 * Apply a standard-sized Grid wrapped to pages with
 * narrow content, like the Field.
 */
const NarrowContainer : React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {children}
    </div>
  );
};

export default NarrowContainer;
