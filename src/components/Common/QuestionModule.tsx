import React, { useState } from 'react';
import { Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClickAwayListener from '@mui/material/ClickAwayListener';
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
  const { innerWidth: width } = window;
  const questionStyle = {
    display: 'inline-block',
    margin: props.margin,
    position: props.position !== undefined ? props.position : 'absolute',
    ...props.style,
  };

  const [show, setShow] = useState(false);

  const handleTooltipClose = () => {
    setShow(false);
  };

  const handleTooltipOpen = () => {
    setShow(true);
  };
  const timer = width < 500 ? 3000 : 250;

  return (
    <Box sx={questionStyle}>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <StyledTooltip
          margin={props.marginTooltip}
          placement={
            props.placement !== undefined ? props.placement : 'right'
          }
          title={props.description}
          width={props.widthTooltip}
          onClose={handleTooltipClose}
          disableFocusListener
          interactive="true"
          open={show}
          leaveDelay={timer}
          onMouseEnter={handleTooltipOpen}
          onMouseLeave={handleTooltipClose}
        >
          <HelpOutlineIcon
            style={{ fontSize: props.fontSize }}
            width="100%"
            onClick={handleTooltipOpen}
          />
        </StyledTooltip>
      </ClickAwayListener>
    </Box>
  );
};

QuestionModule.defaultProps = {
  fontSize: '8px',
};

export default QuestionModule;
