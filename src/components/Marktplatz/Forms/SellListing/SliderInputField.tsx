import React, {  useEffect, useMemo } from 'react';
import {
  Slider,
  SliderProps,
  Stack,
} from '@mui/material';
import { FieldProps } from 'formik';
import BigNumber from 'bignumber.js';

type SliderInputFieldProps = {
  displayValues: number[];
};

const SliderInputField : React.FC<
  SliderInputFieldProps      // custom// MUI TextField
  & FieldProps
  & SliderProps// Formik Field
> = ({
  // -- Custom props
  displayValues,
  // -- Formik props
  form,
  // -- Slider Props
  min,
  max,
}) => {
  const [value2, setValue2] = React.useState<number[]>(displayValues);

  useEffect(() => {
    setValue2(displayValues);
  }, [displayValues]);

  // makes the scroll adjust a little snappier
  const minVal = useMemo(() => form.values.min, [form.values.min]);
  const maxVal = useMemo(() => form.values.max, [form.values.max]);

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[0] !== minVal) {
      setValue2(newValue as number[]);
      form.setFieldValue('min', new BigNumber(newValue[0]));
    }
    if (newValue[1] !== maxVal) {
      setValue2(newValue as number[]);
      form.setFieldValue('max', new BigNumber(newValue[1]));
    }
  };

  return (
    <Stack gap={0.5}>
      <Slider
        min={min}
        max={max}
        getAriaLabel={() => 'Minimum distance shift'}
        value={value2}
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
