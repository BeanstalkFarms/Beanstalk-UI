import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  TextField,
  TextFieldProps, Typography,
} from '@mui/material';
import { FieldProps } from 'formik';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../../../util';

type InputAmountFieldProps = {
  maxValue?: BigNumber | undefined;
  showMaxButton?: boolean
  handleChangeOverride?: any;
};

const InputAmountField : React.FC<
  InputAmountFieldProps      // custom
  & Partial<TextFieldProps> // MUI TextField
  & FieldProps              // Formik Field
> = ({
  // -- Custom props
  maxValue,
  showMaxButton,
  handleChangeOverride,
  // -- Formik props
  field,
  form,
  // -- TextField props
  placeholder,
  disabled,
  sx,
  InputProps,
  // -- Other
  ...props
}) => {
  const [displayAmount, setDisplayAmount] = useState<string>(field.value);
  const inputProps = useMemo(() => ({
    // Styles
    inputProps: {
      min: 0.00,
    },
    classes: {},
    ...InputProps,
  } as TextFieldProps['InputProps']), [InputProps]);

  // const handleChangeAmountOverride =handleChangeAmountOverride useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   // Always update the display amount right away.
  //   handleChangeOverride(e.target.value);
  // }, [handleChangeOverride]);

  // Derived
  // Disable when: explicitly disabled, maxValue is undefined or zero
  const isInputDisabled = (
    disabled
    || (maxValue && maxValue.eq(0))
    || form.isSubmitting
  );

  const handleMax = useCallback(() => {
    form.setFieldValue(field.name, maxValue);
  }, [form, field.name, maxValue]);

  // Handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Always update the display amount right away.
    setDisplayAmount(e.target.value);
    // If set, convert the value to a BigNumber
    const newValue = e.target.value ? new BigNumber(e.target.value) : null;
    // Only update form state if the value is different.
    if (newValue === null || !newValue.eq(field.value)) {
      const finalValue =  ((maxValue && newValue) && newValue.gt(maxValue))
          ? maxValue
          : newValue;
      form.setFieldValue(
        field.name,
        // If a maxValue is provided, enforce it as a maximum.
        finalValue,
      );
      //
      handleChangeOverride?.(finalValue)
    }
  }, [form, field.name, field.value, maxValue, handleChangeOverride]);

  const handleWheel = useCallback((e) => {
    // @ts-ignore
    e.target.blur();
  }, []);

  /** Update display amount when field.value changes externally */
  useEffect(() => {
    // if the value has been removed elsewhere in the form, clear the display amount
    if (!field.value) setDisplayAmount('');
    //
    else if (!field.value.eq(new BigNumber(displayAmount))) setDisplayAmount(field.value.toString());
  }, [field.value, displayAmount]);

  /** Update displayAmount and set field value when the max value changes */
  useEffect(() => {
    if (maxValue && field.value) {
      if (field.value.gt(maxValue)) {
        setDisplayAmount(maxValue.toString());
        form.setFieldValue(
          field.name,
          maxValue
        );
      }
    }
  }, [maxValue, field.name, field.value, form]);

  return (
    <Stack gap={0.5}>
      {/* Input */}
      <TextField
        type="number"
        placeholder={placeholder || '0'}
        disabled={isInputDisabled}
        {...props}
        onWheel={handleWheel}
        value={displayAmount || ''}
        // onChange={handleChangeOverride !== undefined ? handleChangeAmountOverride : handleChange}
        onChange={handleChange}
        InputProps={inputProps}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '1.5rem'
          },
          ...sx
        }}
      />
      {/* Bottom Adornment */}
      {showMaxButton && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} px={0.75}>
          <Typography sx={{ fontSize: 13.5 }}>
            Max Value: {maxValue ? `${displayFullBN(maxValue)}` : '0'}
          </Typography>
          <Typography
            variant="body1"
            onClick={isInputDisabled ? undefined : handleMax}
            color={isInputDisabled ? 'text.secondary' : 'primary'}
            sx={{
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isInputDisabled ? 'inherit' : 'pointer',
            }}
          >
            (Max)
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default InputAmountField;
