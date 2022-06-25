import React, {  useEffect, useMemo } from 'react';
import {
  Slider,
  SliderProps,
  Stack,
} from '@mui/material';
import { FieldProps } from 'formik';
import BigNumber from 'bignumber.js';

type SliderInputFieldProps = {
  initialState: number[] | number;
};

/**
 * Double Slider: the form must have min & max value
 */
const SliderInputField : React.FC<
  SliderInputFieldProps      // custom// MUI TextField
  & FieldProps
  & SliderProps// Formik Field
> = ({
  // -- Custom props
  initialState,
  // -- Formik props
  form,
  field,
  // -- Slider Props
  min,
  max,
}) => {
  const [value, setValue] = React.useState<number[] | number>(initialState);

  // update slider values on double slider when the form's
  // min or max value is changed (i.e. adjusting 'amount' input)
  useEffect(() => {
    if (form.values.min && form.values.max) {
      setValue([form.values.min, form.values.max]);
    }
  }, [form.values.min, form.values.max]);

  // makes the scroll adjust a little snappier
  // === undefined if is a single slider
  const minVal = useMemo(() => form.values.min, [form.values.min]);
  const maxVal = useMemo(() => form.values.max, [form.values.max]);

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    // ----- single slider -----
    if (!Array.isArray(newValue)) {
      setValue(newValue);
      form.setFieldValue(field.name, new BigNumber(newValue));
      return;
    }

    // ----- double slider -----
    if (newValue[0] !== minVal) {
      setValue(newValue as number[]);
      form.setFieldValue('min', new BigNumber(newValue[0]));
    }

    if (newValue[1] !== maxVal) {
      setValue(newValue as number[]);
      form.setFieldValue('max', new BigNumber(newValue[1]));
    }
  };

  return (
    <Stack gap={0.5}>
      <Slider
        min={min}
        max={max}
        getAriaLabel={() => 'Minimum distance shift'}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        disableSwap
        sx={{
          '& .MuiSlider-thumb': {
            backgroundColor: '#FFFFFF',
            border: 2.5,
            boxShadow: 'none',
          },
          '& .MuiSlider-thumb:before': {
            boxShadow: 'none',
          }
        }}
      />
    </Stack>
  );
};

export default SliderInputField;
