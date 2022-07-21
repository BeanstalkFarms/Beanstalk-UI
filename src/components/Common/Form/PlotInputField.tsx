import React, { useCallback, useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { ZERO_BN } from 'constants/index';
import { useFormikContext } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, MaxBN, MinBN } from 'util/index';
import SelectPlotDialog from 'components/Field/SelectPlotDialog';
import { PODS } from 'constants/tokens';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { PlotFragment, PlotSettingsFragment, TokenAdornment, TokenInputField } from '.';
import AdvancedButton from './AdvancedButton';
import SliderField from './SliderField';

const SLIDER_FIELD_KEYS = ['plot.start', 'plot.end'];
const InputPropsLeft  = { endAdornment: 'Start' };
const InputPropsRight = { endAdornment: 'End' };

const PlotInputField : React.FC = () => {
  const { values, setFieldValue } = useFormikContext<{ 
    /// These fields are required in Formik state
    plot: PlotFragment,
    settings: PlotSettingsFragment,
  }>();
  const [dialogOpen, showDialog, hideDialog] = useToggle();

  const farmerField    = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  
  const plot = values.plot;
  const [numPods, numPodsFloat] = useMemo(
    () => {
      if (!plot.index) return [ZERO_BN, 0];
      const _pods = farmerField.plots[plot.index];
      return [_pods, _pods.toNumber()];
    },
    [farmerField.plots, plot.index]
  );
  
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={PODS}
        onClick={showDialog}
        buttonLabel={(
          plot.index ? (
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Typography display="inline" fontSize={16}>@</Typography>
              {displayBN(new BigNumber(plot.index))}
            </Stack>
          ) : 'Select Plot'
        )}
      />
    ),
  }), [plot.index, showDialog]);
  const Quote = useMemo(() => (
    <AdvancedButton
      open={values.settings.showRangeSelect}
      onClick={() => setFieldValue(
        'settings.showRangeSelect',
        !values.settings.showRangeSelect
      )}
    />
  ), [setFieldValue, values.settings.showRangeSelect]);

  ///
  const handlePlotSelect = useCallback((index: string) => {
    const _numPods = new BigNumber(farmerField.plots[index]);
    setFieldValue('plot.index',  index);
    setFieldValue('plot.start',  ZERO_BN);
    setFieldValue('plot.end',    _numPods);
    setFieldValue('plot.amount', _numPods);
  }, [farmerField.plots, setFieldValue]);

  ///
  const handleChangeAmount = (amount: BigNumber | undefined) => {
    if (!amount) {
      /// If the user clears the amount input, set default value
      setFieldValue('plot.start', numPods);
      setFieldValue('plot.end',   numPods);
    } else {
      /// Expand the plot plot range assuming that the right handle is fixed:
      ///
      /// plot                              start     end     amount    next action
      /// -----------------------------------------------------------------------------------
      /// 0 [     |---------|     ] 1000    300       600     300       increase amount by 150
      /// 0 [  |------------|     ] 1000    150       600     450       increase amount by 300
      /// 0 [------------------|  ] 1000    0         750     750       increase amount by 150
      /// 0 [---------------------] 1000    0         1000    1000      reached maximum amount
      const delta = (plot?.end || ZERO_BN).minus(amount);
      setFieldValue('plot.start', MaxBN(ZERO_BN, delta));
      if (delta.lt(0)) {
        setFieldValue('plot.end', MinBN(numPods, (plot?.end || ZERO_BN).plus(delta.abs())));
      }
    }
  };

  ///
  useEffect(() => {
    setFieldValue('plot.amount', plot.end?.minus(plot.start ? plot.start : ZERO_BN));
  }, [setFieldValue, plot.end, plot.start]);

  return (
    <>
      <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        selected={plot.index}
        open={dialogOpen}
      />
      <TokenInputField
        name="plot.amount"
        fullWidth
        InputProps={InputProps}
        // Other
        balance={numPods}
        hideBalance={!plot.index}
        balanceLabel={plot.index ? 'Plot Size' : undefined}
        handleChange={handleChangeAmount}
        quote={plot.index ? Quote : undefined}
      />
      {values.settings.showRangeSelect && (
        <>
          <Box px={1}>
            <SliderField
              min={0}
              max={numPodsFloat}
              fields={SLIDER_FIELD_KEYS}
              initialState={[
                /// The slider is re-initialized whenever this
                /// section gets re-rendered.
                plot.start?.toNumber() || 0,
                plot.end?.toNumber()   || numPodsFloat,
              ]}
              disabled={false}
              // changeMode="onChangeCommitted"
            />
          </Box>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TokenInputField
                name="plot.start"
                placeholder="0.0000"
                max={numPods}
                InputProps={InputPropsLeft}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TokenInputField
                name="plot.end"
                placeholder="0.0000"
                max={numPods} 
                InputProps={InputPropsRight}
                size="small"
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default PlotInputField;
