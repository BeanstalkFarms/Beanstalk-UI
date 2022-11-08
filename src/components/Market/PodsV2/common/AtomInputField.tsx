import { TextFieldProps, TextField } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useAtom } from 'jotai';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';
import { ValueAtom } from '../info/atom-context';

const AtomInputField: React.FC<
  { atom: ValueAtom } & {
    textAlign?: 'left' | 'right';
    disableInput?: boolean;
  } & TextFieldProps
> = ({
  atom: _atom, // rename to avoid conflict w/ atom import
  textAlign = 'right',
  disableInput,
  ...props
}) => {
  const [value, setValue] = useAtom(_atom);

  return (
    <TextField
      type="text"
      placeholder="0"
      value={displayFullBN(value || ZERO_BN, 2)}
      onChange={(e) => {
        if (disableInput) return;
        const v = e.target.value.split(',').join('');
        if (v === '') {
          setValue(ZERO_BN);
        } else {
          setValue(new BigNumber(v));
        }
      }}
      fullWidth
      size="small"
      {...props}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: textAlign,
          fontSize: FontSize.xs,
          '&.Mui-disabled': {
            color: 'text.tertiary',
          },
        },
        ...props.sx,
      }}
    />
  );
};
export default AtomInputField;
