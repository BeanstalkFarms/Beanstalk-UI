import { TextFieldProps, TextField, Typography, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { atom, useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';
import { ZERO_BN } from '~/constants';
import { displayFullBN } from '~/util';
import { ValueAtom } from '../../Market/PodsV2/info/atom-context';

const baseMaxAtom = atom<BigNumber | null>(null);

const AtomInputField: React.FC<
  { atom: ValueAtom<BigNumber | null> } & {
    textAlign?: 'left' | 'right';
    disableInput?: boolean;
    maxAtom?: ValueAtom<BigNumber | null>;
    amountString?: string;
  } & TextFieldProps
> = ({
  atom: _atom, // rename to avoid conflict w/ atom import
  textAlign = 'right',
  disableInput,
  amountString = 'amount',
  maxAtom,
  ...props
}) => {
  const max = useAtomValue(maxAtom || baseMaxAtom);
  const [value, setValue] = useAtom(_atom);

  return (
    <Stack gap={0.4} width="100%">
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
      {maxAtom ? (
        <Typography
          variant="caption"
          color="text.primary"
          component="span"
          textAlign="right"
        >
          {amountString}: {displayFullBN(max || ZERO_BN, 2)}
          <Typography
            display="inline"
            color="primary.main"
            variant="caption"
            sx={{ ml: 0.2, cursor: 'pointer' }}
            onClick={() => {
              max && setValue(max);
            }}
          >
            (max)
          </Typography>
        </Typography>
      ) : null}
    </Stack>
  );
};
export default AtomInputField;
