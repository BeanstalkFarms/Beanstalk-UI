import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { FormatTooltip } from './index';

export default function QuestionModule(props) {
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
  const timer = width < 500 ? 4000 : 1000;

  return (
    <Box style={questionStyle}>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <FormatTooltip
          margin={props.marginTooltip}
          placement={
            props.placement !== undefined ? props.placement : 'top-start'
          }
          title={props.description}
          width={props.widthTooltip}
          onClose={handleTooltipClose}
          disableFocusListener
          interactive
          open={show}
          leaveDelay={timer}
          onMouseEnter={handleTooltipOpen}
          onMouseLeave={handleTooltipClose}
        >
          <HelpOutlineIcon
            style={{ fontSize: '8px' }}
            width="100%"
            onClick={handleTooltipOpen}
          />
        </FormatTooltip>
      </ClickAwayListener>
    </Box>
  );
}

QuestionModule.defaultProps = {
  fontSize: '8px',
};
