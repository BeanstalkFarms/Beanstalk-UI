import React, { useState } from 'react';
import { Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { StyledTooltip } from './index';

type QuestionModuleProps = {
  margin?: string;
  position?: string;
  style?: any;
  marginTooltip?: string;
  placement?: string;
  description?: string;
  widthTooltip?: string | number;
  fontSize?: string;
}

const QuestionModule : React.FC<QuestionModuleProps> = (props) => {
  return (
    <Box sx={{
      display: 'inline-block',
      margin: props.margin, // || '-8px 0 0 2px',
      position: props.position !== undefined ? props.position : 'absolute',
      ...props.style,
    }}>
      <StyledTooltip
        margin={props.marginTooltip}
        placement={
          props.placement !== undefined ? props.placement : 'right'
        }
        title={props.description}
      >
        <HelpOutlineIcon
          style={{ fontSize: props.fontSize }}
          width="100%"
        />
      </StyledTooltip>
    </Box>
  );
};

QuestionModule.defaultProps = {
  fontSize: '8px',
};

export default QuestionModule;
