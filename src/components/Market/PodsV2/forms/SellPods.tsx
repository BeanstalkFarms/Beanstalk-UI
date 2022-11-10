import {
  InputAdornment,
  Stack,
  Typography,
  styled,
  Slider,
  SliderThumb,
} from '@mui/material';

import BigNumber from 'bignumber.js';
import { atom, useAtom } from 'jotai';
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
import AtomInputField from '../../../Common/Atom/AtomInputField';
import PlaceInLineSlider from '../common/PlaceInLineSlider';
import {
  selectedPlotAmountAtom,
  selectedPlotAtom,
  selectedPlotStartAtom,
  selectedPlotEndAtom,
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
    if (!amount) return null;
    if (amount.lt(0)) return ZERO_BN;
    return amount;
  }, []);

  const handlePlotSelect = useCallback(
    (index: string) => {
      console.log('index: ', index);
      const numPodsClamped = clamp(new BigNumber(plots[index]));
      setSelectedPlot({
        index,
        amount: numPodsClamped,
        start: ZERO_BN,
        end: numPodsClamped,
      });
      console.log('numpodsclamped: ', numPodsClamped?.toNumber());
    },
    [clamp, plots, setSelectedPlot]
  );

  // max amount of pods for selected plot
  const maxAtom = useMemo(
    () =>
      atom(
        selectedPlot?.index ? new BigNumber(plots[selectedPlot.index]) : null
      ),
    [plots, selectedPlot?.index]
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
              <Typography variant="caption">
                {`@ ${displayBN(
                  new BigNumber(selectedPlot.index).minus(harvestableIndex)
                )}`}
              </Typography>
            ) : (
              <Typography variant="caption">Select Plot</Typography>
            )
          }
        />
      ),
      startAdornment: (
        <InputAdornment position="start">
          <Typography variant="caption" color="text.primary">
            AMOUNT
          </Typography>
        </InputAdornment>
      ),
    }),
    [harvestableIndex, selectedPlot?.index, setOpen]
  );

  return (
    <>
      <AtomInputField
        atom={selectedPlotAmountAtom}
        InputProps={InputProps}
        amountString="PlotSize"
        maxAtom={maxAtom}
      />
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

interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> {}

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: 'primary.main',
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    width: '8px',
    height: '10px',
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 2px primary.main',
    },
    '& .airbnb-bar': {
      position: 'relative',
      bottom: '-10px',
      width: '10px',
      height: '8px',
      borderStyle: 'solid',
      borderWidth: '0 5px 8px 5px',
      borderColor: 'transparent transparent #000000 transparent',
    },
  },
  '& .MuiSlider-track': {
    height: 3,
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#d8d8d8',
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 3,
  },
}));

const minSliderDistance = 1;
const SelectedPlotSlider: React.FC<{}> = () => {
  const plots = useSelector<AppState, AppState['_farmer']['field']['plots']>(
    (state) => state._farmer.field.plots
  );
  const [selectedPlot, setSelectedPlot] = useAtom(selectedPlotAtom);

  const [start, setStart] = useAtom(selectedPlotStartAtom);
  const [end, setEnd] = useAtom(selectedPlotEndAtom);
  const [amount, setAmount] = useAtom(selectedPlotAmountAtom);
  const harvestableIndex = useHarvestableIndex();

  const handleChange = useCallback(
    (_e: Event, newValue: number | number[], activeThumb: number) => {
      if (!Array.isArray(newValue)) {
        return;
      }
      if (activeThumb === 0) {
        setStart(
          new BigNumber(Math.min(newValue[0], newValue[1] - minSliderDistance))
        );
      } else {
        setEnd(
          new BigNumber(Math.max(newValue[1], newValue[0] + minSliderDistance))
        );
      }
      setAmount(end && start ? end.minus(start) : null);
    },
    [end, start, setAmount, setEnd, setStart]
  );

  if (!selectedPlot?.index) return null;

  return (
    <Stack px={0.8}>
      <Stack px={2}>
        <Slider
          color="primary"
          min={0}
          max={new BigNumber(plots[selectedPlot?.index]).toNumber() || 100}
          value={[start?.toNumber() || 0, end?.toNumber() || 100]}
          onChange={handleChange}
          disableSwap
          size="small"
          components={{ Thumb: AirbnbThumbComponent }}
        />
      </Stack>
      <Row gap={0.8} width="100%" justifyContent="space-between">
        <AtomInputField
          atom={selectedPlotStartAtom}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="caption" color="text.primary">
                  START
                </Typography>
              </InputAdornment>
            ),
          }}
        />
        <AtomInputField
          atom={selectedPlotEndAtom}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="caption" color="text.primary">
                  END
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Row>
    </Stack>
  );
};

const SellPods: React.FC<{}> = () => {
  const s = '';
  return (
    <Stack pb={0.8}>
      <Stack py={0.8} px={0.8}>
        <SelectPlotField />
      </Stack>
      <SelectedPlotSlider />
      <Stack px={1.6} gap={0.8}>
        <PlaceInLineSlider canSlide={false} />
      </Stack>
    </Stack>
  );
};

export default SellPods;
