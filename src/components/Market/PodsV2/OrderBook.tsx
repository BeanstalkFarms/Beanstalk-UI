import { CircularProgress, Grid, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import CondensedCard from '~/components/Common/Card/CondensedCard';
import Row from '~/components/Common/Row';
import SelectionGroup from '~/components/Common/SingleSelectionGroup';
import ToggleGroup from '~/components/Common/ToggleGroup';
import Centered from '~/components/Common/ZeroState/Centered';
import { ZERO_BN } from '~/constants';
import useOrderbook, {
  OrderbookAggregation,
  OrderbookPrecision,
} from '~/hooks/beanstalk/useOrderbook';
import { displayBN } from '~/util';
import { scrollbarStyles } from './common/tableStyles';

const ORDER_GREEN = '#60D394';
const LISTING_RED = '#EC4067';

const precisionOptions: OrderbookPrecision[] = [0.01, 0.02, 0.05, 0.1];

const CELL_HEIGHT = 21.91;

const toggleOptions = [
  { value: 'min-max', label: 'MIN/MAX' },
  { value: 'avg', label: 'AVG' },
];

const OrderBook: React.FC<{}> = () => {
  const [precision, setPrecision] = useState<OrderbookPrecision>(
    precisionOptions[0]
  );
  const [aggregation, setAggregation] =
    useState<OrderbookAggregation>('min-max');
  const { data, error, reduceByPrecision } = useOrderbook();

  const filteredData = useMemo(() => {
    if (!data) return undefined;
    return Object.entries(
      reduceByPrecision({ precision, priceBuckets: data })
    ).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
  }, [data, precision, reduceByPrecision]);

  const isMinMax = aggregation === 'min-max';

  const tableHeight = useMemo(() => {
    if (!filteredData) return '100%';
    return `${filteredData.length * CELL_HEIGHT}px`;
  }, [filteredData]);

  const showData = true;

  return (
    <CondensedCard
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      title="ORDERBOOK"
      actions={
        <Row gap={1}>
          <ToggleGroup
            value={aggregation}
            exclusive
            size="small"
            onChange={(_e, v) => setAggregation((prev) => v || prev)}
            options={toggleOptions}
            fontSize="xs"
          />
          <SelectionGroup
            options={precisionOptions}
            value={precision}
            setValue={setPrecision}
            fontSize="xs"
          />
        </Row>
      }
    >
      <Stack
        height="100%"
        sx={{
          borderTop: '0.5px solid',
          borderColor: 'divider',
          ...scrollbarStyles,
        }}
        py={1}
      >
        {/* TABLE HEADER */}
        <Grid container direction="row" spacing={1} px={1.5}>
          <Grid item container xs={1.5}>
            <Grid item xs={12} alignItems="flex-start" textAlign="left">
              <Typography variant="caption" color="text.secondary">
                PRICE
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs={5.25}>
            <Grid item xs={6} alignItems="flex-start" textAlign="left">
              <Typography variant="caption" color="text.secondary">
                DEPTH(BEAN)
              </Typography>
            </Grid>
            <Grid item xs={6} alignItems="flex-end" textAlign="right">
              <Typography variant="caption" color="text.secondary">
                {isMinMax ? 'MAX' : 'AVG'} PLACE IN LINE (BUY)
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs={5.25}>
            <Grid item xs={6} alignItems="flex-start">
              <Typography variant="caption" color="text.secondary">
                {isMinMax ? 'MIN' : 'AVG'} PLACE IN LINE (SELL)
              </Typography>
            </Grid>
            <Grid item xs={6} alignItems="flex-end" textAlign="right">
              <Typography variant="caption" color="text.secondary">
                DEPTH(PODS)
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {/*
         *TABLE BODY
         */}
        {error ? (
          <Centered p={2}>
            <Typography color="text.tertiary">
              There was an error fetching data
            </Typography>
          </Centered>
        ) : !filteredData || filteredData?.length === 0 ? (
          <Centered>
            <CircularProgress />
          </Centered>
        ) : (
          <Stack
            height="100%"
            sx={({ breakpoints: b }) => ({
              overflow: 'auto',
              pb: 1,
              // TODO: FIX THIS. this is a hack to make the table scroll all the way to the bottom
              [b.up('lg')]: {
                pb: 6,
              },
            })}
          >
            {filteredData.map(([priceKey, bucket]) => (
              <Grid
                container
                item
                direction="row"
                spacing={1}
                px={1.5}
                py={0}
                key={priceKey}
              >
                <Grid item container xs={1.5}>
                  {/*
                   * PRICE DATA
                   */}
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.primary">
                      {priceKey}
                    </Typography>
                  </Grid>
                </Grid>
                {/*
                 * BUY DATA
                 */}
                <Grid item container xs={5.25}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: ORDER_GREEN }}>
                      {displayBN(bucket.depth.bean || ZERO_BN)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} alignItems="flex-end" textAlign="right">
                    <Typography variant="caption" sx={{ color: ORDER_GREEN }}>
                      {displayBN(
                        isMinMax
                          ? bucket.placeInLine.buy.max
                          : bucket.placeInLine.buy.avg
                      )}
                    </Typography>
                  </Grid>
                </Grid>
                {/*
                 *  SELL DATA
                 */}
                <Grid item container xs={5.25}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: LISTING_RED }}>
                      {displayBN(
                        isMinMax
                          ? bucket.placeInLine.sell.min
                          : bucket.placeInLine.sell.avg
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} alignItems="flex-end" textAlign="right">
                    <Typography variant="caption" sx={{ color: LISTING_RED }}>
                      {displayBN(bucket.depth.pods)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Stack>
        )}
      </Stack>
    </CondensedCard>
  );
};

export default OrderBook;
