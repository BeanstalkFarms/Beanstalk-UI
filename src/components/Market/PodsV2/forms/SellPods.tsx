import { Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useAtom } from 'jotai';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TokenAdornment } from '~/components/Common/Form';
import Row from '~/components/Common/Row';
import PlotSelectDialog from '~/components/Field/PlotSelectDialog';
import { ZERO_BN } from '~/constants';
import { PODS } from '~/constants/tokens';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import useToggle from '~/hooks/display/useToggle';
import { AppState } from '~/state';
import { displayBN } from '~/util';
import AtomInputField from '../common/AtomInputField';
import {
  selectedPlotAtom,
  selectedPlotNumPodsAtom,
} from '../info/atom-context';

const SelectPlotField: React.FC<{}> = () => {
  // State
  const plots = useSelector<AppState, AppState['_farmer']['field']['plots']>(
    (state) => state._farmer.field.plots
  );
  const [open, setOpen, close] = useToggle();
  const [selectedPlot, setSelectedPlot] = useAtom(selectedPlotAtom);
  const harvestableIndex = useHarvestableIndex();

  /// Clamp
  const clamp = useCallback((amount: BigNumber | undefined) => {
    if (!amount) return undefined;
    if (amount.lt(0)) return ZERO_BN;
    return amount;
  }, []);

  const handlePlotSelect = useCallback(
    (index: string) => {
      const numPodsClamped = clamp(new BigNumber(plots[index]));
      console.log('numpodsclamped: ', numPodsClamped?.toNumber());
    },
    [clamp, plots]
  );

  const InputProps = useMemo(
    () => ({
      endAdornment: (
        <TokenAdornment
          token={PODS}
          onClick={setOpen}
          iconSize="xs"
          downArrowIconSize="small"
          buttonLabel={
            selectedPlot?.index ? (
              <Row gap={0.75}>
                <Typography display="inline" variant="caption">
                  @
                </Typography>
                {displayBN(
                  new BigNumber(selectedPlot.index).minus(harvestableIndex)
                )}
              </Row>
            ) : (
              <Typography variant="caption">Select Plot</Typography>
            )
          }
        />
      ),
    }),
    [harvestableIndex, selectedPlot?.index, setOpen]
  );

  return (
    <>
      <AtomInputField atom={selectedPlotNumPodsAtom} InputProps={InputProps} />
      <PlotSelectDialog
        open={open}
        harvestableIndex={harvestableIndex}
        handlePlotSelect={handlePlotSelect}
        handleClose={close}
        plots={plots}
        selected={selectedPlot?.index}
      />
    </>
  );
};

const SellPods: React.FC<{}> = () => {
  const s = '';
  return (
    <Stack>
      <SelectPlotField />
    </Stack>
  );
};

export default SellPods;
