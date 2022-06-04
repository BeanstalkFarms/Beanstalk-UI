import React from 'react';
import { Box } from '@mui/material';
import { Token, TokenImage, TokenLabel, TokenTypeImage } from 'util/index';
import { makeStyles } from '@mui/styles';
import { QuestionModule } from './index';

const useStyles = makeStyles({
  root: {
    height: '25px',
    width: '30px',
  },
  tokenTypeStyle: {
    height: '100%',
    width: '100%',
  },
  // FIXME: we should never position things like this
  tokenTypeModifierStyle: {
    bottom: '20%',
    height: '30%',
    left: '48%',
    position: 'absolute',
  }
});

export default function TabImageModule(props: {
  style?: any;
  token: Token;
  description: string;
}) {
  const classes = useStyles();
  return (
    <Box style={props.style} className={classes.root}>
      <img
        alt={TokenLabel(props.token)}
        src={TokenImage(props.token)}
        className={classes.tokenTypeStyle}
      />
      <img
        alt=""
        src={TokenTypeImage(props.token) || undefined}
        className={classes.tokenTypeModifierStyle}
      />
      <QuestionModule
        description={props.description}
        margin="-12px 0 0px -5px"
      />
    </Box>
  );
}
