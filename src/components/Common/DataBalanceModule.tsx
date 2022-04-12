import React from 'react';
import { Box } from '@mui/material';
import { FormatTooltip, QuestionModule } from '.';

export default function DataBalanceModule(props) {
  const spanContent = (
    <span>
      {props.content !== undefined ? (
        props.content
      ) : (
        <Box className="BalanceModule-balanceContent" sx={props.style}>
          {props.balance}
        </Box>
      )}
    </span>
  );

  const balanceSection =
    props.balanceDescription !== undefined ? (
      <FormatTooltip
        margin={props.margin}
        placement={props.placement !== undefined ? props.placement : 'right'}
        title={props.balanceDescription}
      >
        {spanContent}
      </FormatTooltip>
    ) : (
      spanContent
    );

  return (
    <Box>
      <Box
        className={`BalanceModule-title${
          props.swerve !== undefined ? ' TokenBalanceModule-header' : ''
        }`}
        sx={props.style}
      >
        {props.title}
        <QuestionModule
          description={props.description}
          margin={props.questionMargin}
          widthTooltip={props.widthTooltip}
        />
      </Box>
      <Box
        className={`BalanceModule-balance${
          props.swerve !== undefined ? ' TokenBalanceModule-content' : ''
        }`}
        sx={props.style}
      >
        {balanceSection}
      </Box>
    </Box>
  );
}

DataBalanceModule.defaultProps = {
  questionMargin: '-8px 0 0 -1px',
};
