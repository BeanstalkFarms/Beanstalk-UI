import { StackProps, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { PrimitiveAtom, useAtomValue } from 'jotai';
import React from 'react';
import Row from '~/components/Common/Row';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';

const AtomOutputField: React.FC<
  {
    atom: PrimitiveAtom<BigNumber>;
    label?: string;
    info?: string;
    formatValue?: (...props: any | any[]) => string;
  } & StackProps
> = ({ atom: _atom, label, info, formatValue, ...stackProps }) => {
  const value = useAtomValue(_atom);

  return (
    <Row
      width="100%"
      justifyContent="space-between"
      {...stackProps}
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'text.primary',
        ...stackProps.sx,
      }}
    >
      <Typography variant="caption" color="text.primary">
        {label}
      </Typography>
      <Typography variant="caption" color="text.primary" textAlign="right">
        {`${
          formatValue ? formatValue(value) : displayFullBN(value || ZERO_BN, 2)
        } ${info || ''}`}
      </Typography>
    </Row>
  );
};

export default AtomOutputField;
