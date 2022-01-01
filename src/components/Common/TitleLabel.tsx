import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

export default function TitleLabel(props) {
  const classes = makeStyles(() => ({
    label: {
      borderRadius: '15px',
      fontFamily: 'Futura-PT-Book',
      fontSize: props.size || '24px',
      margin: props.margin || '0',
      padding: props.padding || '5px',
      textTransform: props.textTransform,
      fontWeight: 'bold',
      color: 'white', // HOTFIX
    },
  }))();

  return (
    <Box className={classes.label} style={props.style}>
      {props.children}
    </Box>
  );
}

TitleLabel.defaultProps = {
  textTransform: 'uppercase',
};
