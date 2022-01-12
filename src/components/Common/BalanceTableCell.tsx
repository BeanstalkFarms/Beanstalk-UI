import React from 'react';
import { TableCell } from '@material-ui/core';
import { displayBN, displayFullBN } from 'util/index';
import { FormatTooltip } from '.';

export default function BalanceTableCell({ align, color, className, balance, label }) {
    return (
      <TableCell
        align={align}
        className={className}
        style={{ color: color }}
      >
        <FormatTooltip
          placement="right"
          title={`${displayFullBN(balance)} ${label}`}
        >
          <span>{displayBN(balance)}</span>
        </FormatTooltip>
      </TableCell>
    );
}

BalanceTableCell.defaultProps = {
    align: 'right',
};
