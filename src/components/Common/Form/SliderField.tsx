import React, { useCallback, useEffect } from 'react';
import {
  Slider,
  SliderProps,
} from '@mui/material';
import { useFormikContext } from 'formik';
import BigNumber from 'bignumber.js';

type SliderFieldProps = {
  initialState: number[] | number;
  /**
   * Pass one field if it is a single slider,
   * and two fields if it is a double slider
   */
  fields: string[];
};

/**
 * Double Slider: the form must have min & max value
 */
const SliderField : React.FC<
  SliderFieldProps
  & SliderProps// Formik Field
> = ({
  /// Custom props
  initialState,
  fields,
  /// Slider Props
  min,
  max,
  sx,
  ...props
}) => {
  const [value, setValue] = React.useState<number[] | number>(initialState);
  const { values, setFieldValue } = useFormikContext<any>();

  // update single & double sliders' values when the form's
  // values are changed (ex: adjusting 'amount' input)
  useEffect(() => {
    if (fields) {
      // single slider
      if (fields.length === 1) {
        setValue(values[fields[0]]);
        // double slider
      } else if (fields.length === 2) {
        if (values[fields[0]] && values[fields[1]]) {
          setValue([
            values[fields[0]],
            values[fields[1]]
          ]);
        }
      }
    }
  }, [values, fields]);

  const minVal = values[fields[0]];
  const maxVal = values[fields[1]];

  const handleChange = useCallback((
    event: Event,
    newValue: number | number[],
    // activeThumb: number,
  ) => {
    // ----- single slider -----
    if (!Array.isArray(newValue)) {
      setValue(newValue);
      setFieldValue(fields[0], new BigNumber(newValue));
      return;
    }

    // ----- double slider -----
    if (newValue[0] !== minVal) {
      setValue(newValue as number[]);
      setFieldValue(fields[0], new BigNumber(newValue[0]));
    }

    if (newValue[1] !== maxVal) {
      setValue(newValue as number[]);
      setFieldValue(fields[1], new BigNumber(newValue[1]));
    }
  }, [
    fields,
    maxVal,
    minVal,
    setFieldValue
  ]);

  return (
    <Slider
      min={min}
      max={max}
      getAriaLabel={() => 'Minimum distance shift'}
      value={value}
      onChange={handleChange}
      // valueLabelFormat={}
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
        },
        ...sx
      }}
      {...props}
    />
  );
};

export default SliderField;
