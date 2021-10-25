import React from 'react';
import { Box } from '@material-ui/core';
import { TokenImage, TokenLabel, TokenTypeImage } from '../../util';
import { QuestionModule } from './index';

export default function TabImageModule(props) {
  const tokenTypeStyle = {
    height: '100%',
    width: '100%',
  };
  const tokenTypeModifierStyle = {
    bottom: '20%',
    height: '30%',
    left: '48%',
    position: 'absolute',
  };

  return (
    <Box style={{ ...props.style }}>
      <img
        alt={TokenLabel(props.token)}
        src={TokenImage(props.token)}
        style={tokenTypeStyle}
      />
      <img
        alt=""
        src={TokenTypeImage(props.token)}
        style={tokenTypeModifierStyle}
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
