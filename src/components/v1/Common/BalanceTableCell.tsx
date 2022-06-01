import React from 'react';
import { TableCell } from '@mui/material';
import { displayBN, displayFullBN } from 'util/index';
import { StyledTooltip } from '.';

export default function BalanceTableCell({
  align,
  color,
  className,
  balance,
  label,
  icon,
  children,
  title,
}) {
  return (
    <TableCell
      align={align}
      className={className}
      style={{ color: color }}
    >
      <StyledTooltip
        placement="right"
        title={title || `${displayFullBN(balance)} ${label}`}
      >
        {/* Allow some cells to set a custom table child. Default to showing provided balance.
            This is for backwards compatibility with existing tables. Both need to be wrapped in
            a <span> to ensure proper tooltip ref forwarding. */}
        {children ? (
          <span>
            {children}
            {icon ? <span>{icon}</span> : null}
          </span>
        ) : (
          <span>
            <span>{displayBN(balance)}</span>
            {icon ? <span>{icon}</span> : null}
          </span>
        )}
      </StyledTooltip>
    </TableCell>
  );
}

BalanceTableCell.defaultProps = {
  align: 'right',
  title: undefined,
};
