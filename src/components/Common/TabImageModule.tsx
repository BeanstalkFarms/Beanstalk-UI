import React from 'react';
import { Box } from '@material-ui/core';
import { TokenImage, TokenLabel, TokenTypeImage } from 'util/index';
import { makeStyles } from '@material-ui/styles';
import { QuestionModule } from './index';

const useStyles = makeStyles({
  tokenTypeStyle: {
    height: '100%',
    width: '100%',
  },
  tokenTypeModifierStyle: {
    bottom: '20%',
    height: '30%',
    left: '48%',
    position: 'absolute',
  }
});

export default function TabImageModule(props) {
  const classes = useStyles();

  return (
    <Box style={{ ...props.style }}>
      <img
        alt={TokenLabel(props.token)}
        src={TokenImage(props.token)}
        className={classes.tokenTypeStyle}
      />
      <img
        alt=""
        src={TokenTypeImage(props.token)}
        className={classes.tokenTypeModifierStyle}
      />
      <QuestionModule
        description={props.description}
        margin="-12px 0 0px -5px"
      />
    </Box>
  );
}

TabImageModule.defaultProps = {
  style: { height: '25px', width: '30px' },
};
