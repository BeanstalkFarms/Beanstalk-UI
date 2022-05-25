import React, { useEffect, useMemo, useState } from 'react';
import { Theme } from '@emotion/react';
import {
  Box,
  Button,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  TextField,
  TextFieldProps,
  Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { makeStyles } from '@mui/styles';
import BigNumber from 'bignumber.js';

import { StyledDialog, StyledDialogContent, StyledDialogTitle } from 'components/v2/Common/Dialog';
import { displayBN } from 'util/index';
import Token from 'classes/Token';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { TokensByAddress } from 'constants/v2/tokens';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';

const InputField : React.FC<{ name: string; } & TextFieldProps> = ({
  // 
  name,
  // TextFieldProps
  sx,
  InputProps,
  placeholder,
  ...props
}) => {
  const inputProps = useMemo(() => ({
    // Styles
    inputProps: {
      min: 0.00,
    },
    classes: {},
    ...InputProps,
  }), [InputProps])
  return (
    <>
      <Field name={name}>
        {({ field, form, meta } : FieldProps) => (
          <TextField
            type="number"
            placeholder={placeholder || '0'}
            {...field}
            {...props}
            InputProps={inputProps}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.5rem'
              },
              ...sx
            }}
          />
        )}
      </Field>
      <div>{name}: render {new Date().toISOString()}</div>
    </>
  );
};

export default InputField;
