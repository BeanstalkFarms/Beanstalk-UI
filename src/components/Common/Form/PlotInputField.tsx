import React, { useCallback, useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { ZERO_BN } from 'constants/index';
import { useFormikContext } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { displayBN, MaxBN, MinBN } from 'util/index';
import PlotSelectDialog from 'components/Field/PlotSelectDialog';
import { PODS } from 'constants/tokens';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { PlotMap } from 'state/farmer/field';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import { PlotFragment, PlotSettingsFragment, TokenAdornment, TokenInputField } from '.';
import AdvancedButton from './AdvancedButton';
import SliderField from './SliderField';

const SLIDER_FIELD_KEYS = ['plot.start', 'plot.end'];
const InputPropsLeft  = { endAdornment: 'Start' };
const InputPropsRight = { endAdornment: 'End' };

const PlotInputField : React.FC<{
  /** All plots that are selectable via the input field */
  plots: PlotMap<BigNumber>,
}> = ({
  plots
}) => {
  /// Form state
  const { values, setFieldValue, isSubmitting } = useFormikContext<{ 
    /// These fields are required in the parent's Formik state
    plot: PlotFragment,
    settings: PlotSettingsFragment,
  }>();

  /// Local state
  const [dialogOpen, showDialog, hideDialog] = useToggle();

  /// Data
  const harvestableIndex = useHarvestableIndex();
  
  /// Find the currently selected plot from form state.
  /// If selected, grab the number of pods from the farmer's field state.
  const plot = values.plot;
  const [numPods, numPodsFloat] = useMemo(
    () => {
      if (!plot.index) return [ZERO_BN, 0];
      const _pods = plots[plot.index];
      return [_pods, _pods.toNumber()];
    },
    [plots, plot.index]
  );
  
  /// Button to select a new plot
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={PODS}
        onClick={showDialog}
        buttonLabel={(
          plot.index ? (
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Typography display="inline" fontSize={16}>@</Typography>
              {displayBN(new BigNumber(plot.index).minus(harvestableIndex))}
            </Stack>
          ) : 'Select Plot'
        )}
      />
    ),
  }), [
    harvestableIndex,
    plot.index,
    showDialog
  ]);

  /// "Advanced" control in the Quote slot
  const Quote = useMemo(() => (
    <AdvancedButton
      open={values.settings.showRangeSelect}
      onClick={() => setFieldValue(
        'settings.showRangeSelect',
        !values.settings.showRangeSelect
      )}
    />
  ), [setFieldValue, values.settings.showRangeSelect]);

  /// Select a new plot
  const handlePlotSelect = useCallback((index: string) => {
    const _numPods = new BigNumber(plots[index]);
    setFieldValue('plot.index',  index);
    setFieldValue('plot.start',  ZERO_BN);
    setFieldValue('plot.end',    _numPods);
    setFieldValue('plot.amount', _numPods);
  }, [plots, setFieldValue]);

  /// Update amount
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

  /// Update amount when an endpoint changes via the advanced controls
  useEffect(() => {
    setFieldValue('plot.amount', plot.end?.minus(plot.start || ZERO_BN));
  }, [setFieldValue, plot.end, plot.start]);

  return (
    <>
      <PlotSelectDialog
        plots={plots}
        harvestableIndex={harvestableIndex}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        selected={plot.index}
        open={dialogOpen}
      />
      <TokenInputField
        name="plot.amount"
        fullWidth
        InputProps={InputProps}
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
              disabled={isSubmitting}
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
