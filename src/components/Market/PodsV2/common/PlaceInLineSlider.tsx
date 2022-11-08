import { Stack, Slider, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useAtom } from 'jotai';
import React from 'react';
import { useSelector } from 'react-redux';
import Row from '~/components/Common/Row';
import { ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import { displayBN } from '~/util';
import { placeInLineAtom } from '../info/atom-context';

const PlaceInLineSlider: React.FC<{
  disabled?: boolean;
  canSlide?: boolean;
}> = ({ disabled, canSlide = true }) => {
  // state
  const [index, setIndex] = useAtom(placeInLineAtom);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const fieldMaxIndex = beanstalkField?.podLine || ZERO_BN;

  return (
    <Stack>
      <Slider
        color="primary"
        aria-label="place-in-line"
        value={index.toNumber()}
        onChange={(_, v) => {
          canSlide && setIndex(new BigNumber(v as number));
        }}
        min={0}
        max={fieldMaxIndex.toNumber()}
        disabled={disabled}
        sx={{ cursor: canSlide && !disabled ? 'pointer' : 'default' }}
      />
      <Row width="100%">
        <Typography color="text.tertiary" variant="caption">
          0
        </Typography>
        <Typography width="100%" textAlign="center" variant="caption">
          Place in Line: 0 -{' '}
          <Typography component="span" color="text.tertiary" variant="caption">
            {displayBN(index)}
          </Typography>
        </Typography>
        <Typography color="text.tertiary" variant="caption">
          {displayBN(fieldMaxIndex)}
        </Typography>
      </Row>
    </Stack>
  );
};

export default PlaceInLineSlider;
