import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Slider,
  SliderProps,
} from '@mui/material';
import { useFormikContext } from 'formik';
import throttle from 'lodash/throttle';
import BigNumber from 'bignumber.js';

type SliderFieldProps = {
  initialState: number[] | number;
  /**
   * Pass one field if it is a single slider,
   * and two fields if it is a double slider
   */
  fields: string[];
  /**
   * 
   */
  changeMode?: 'onChange' | 'onChangeCommitted';
  /**
   * 
   */
  throttleMs?: number;
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
  changeMode = 'onChange',
  throttleMs = 25,
  /// Slider Props
  min,
  max,
  sx,
  ...props
}) => {
  /// story a copy of the form's value
  const [internalValue, setInternalValue] = React.useState<number | number[]>(initialState);

  ///
  const { values, setFieldValue } = useFormikContext<any>();

  // update single & double sliders' values when the form's
  // values are changed (ex: adjusting 'amount' input)
  useEffect(() => {
    // single slider
    if (fields.length === 1) {
      setInternalValue(values[fields[0]]);
      // double slider
    } else if (fields.length === 2) {
      if (values[fields[0]] && values[fields[1]]) {
        setInternalValue([
          values[fields[0]],
          values[fields[1]]
        ]);
      }
    }
  }, [
    values,
    fields
  ]);

  /// @note `fields` needs to be memoized elsewhere if it's an array,
  /// otherwise this callback refreshes on every render (and thus, so
  /// does throttling).
  const updateExternal = useCallback((newValue: number | number[], activeThumb?: number) => {
    /// Single slider
    if (typeof newValue === 'number') {
      setFieldValue(fields[0], new BigNumber(newValue));
    }
    /// Double slider
    else if (activeThumb) {
      /// optimization: onChange provides the slider handle that changed
      setFieldValue(fields[activeThumb], new BigNumber(newValue[activeThumb]));
    } else {
      setFieldValue(fields[0], new BigNumber(newValue[0]));
      setFieldValue(fields[1], new BigNumber(newValue[1]));
    }
  }, [fields, setFieldValue]);

  const updateExternalThrottled = useMemo(
    () => throttle(updateExternal, throttleMs),
    [updateExternal, throttleMs]
  );
  
  const changeHandlers = useMemo(() => ({
    onChange: (event: Event, newValue: number | number[], activeThumb: number) => {
      /// Always update internal state immediately.
      setInternalValue(newValue);
      /// If requested, push throttled change to the form.
      if (changeMode === 'onChange') {
        updateExternalThrottled(newValue, activeThumb);
      }
    },
    onChangeCommitted: (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
      if (changeMode === 'onChangeCommitted') {
        updateExternalThrottled(newValue);
      } else {
        /// flush the existing onChange call
        updateExternalThrottled.flush();
      }
    }
  }), [changeMode, updateExternalThrottled]);

  return (
    <Slider
      min={min}
      max={max}
      value={internalValue}
      {...changeHandlers}
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
