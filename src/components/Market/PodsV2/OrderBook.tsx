import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import SelectionGroup from '~/components/Common/SingleSelectionGroup';
import ToggleGroup from '~/components/Common/ToggleGroup';
import Centered from '~/components/Common/ZeroState/Centered';
import useOrderbook, {
  OrderbookAggregation,
  OrderbookPrecision,
} from '~/hooks/beanstalk/useOrderbook';
import { displayBN } from '~/util';
import { scrollbarStyles } from './common/tableStyles';

const ORDER_GREEN = '#42885D';
const LISTING_RED = '#DA5F49';

const precisionOptions: OrderbookPrecision[] = [0.01, 0.02, 0.05, 0.1];

const CELL_HEIGHT = 30;

const OrderBook: React.FC<{}> = () => {
  const [precision, setPrecision] = useState<OrderbookPrecision>(
    precisionOptions[0]
  );
  const [aggregation, setAggregation] =
    useState<OrderbookAggregation>('min-max');
  const { data, error, loading, reduceByPrecision } = useOrderbook();

  const filteredData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return Object.entries(reduceByPrecision({ precision, priceBuckets: data }));
  }, [data, precision, reduceByPrecision]);

  const isMinMax = aggregation === 'min-max';

  const tableHeight = useMemo(() => {
    if (!filteredData) {
      return '100%';
    }
    return `${filteredData.length * CELL_HEIGHT}px`;
  }, [filteredData]);

  return (
    <Card
      sx={({ breakpoints: bp }) => ({
        height: '100%',
        [bp.up('md')]: {
          minWidth: '400px',
        },
      })}
    >
      <Stack height="100%">
        <Row justifyContent="space-between" width="100%" p={0.8}>
          <Typography variant="bodySmall" fontWeight={FontWeight.bold}>
            ORDERBOOK
          </Typography>
          <Row gap={1}>
            <ToggleGroup
              value={aggregation}
              exclusive
              size="small"
              onChange={(_e, v) => setAggregation((prev) => v || prev)}
              options={[
                { value: 'min-max', label: 'MIN/MAX' },
                { value: 'avg', label: 'AVG' },
              ]}
              fontSize="xs"
            />
            <SelectionGroup
              options={precisionOptions}
              value={precision}
              setValue={setPrecision}
              fontSize="xs"
            />
          </Row>
        </Row>
        <Divider />
        <Stack px={1.6} py={0.8} width="100%" height="100%">
          {/*
           * TABLE HEADER
           */}
          <Grid container direction="row" spacing={0.8}>
            {/*
             * PRICE COLUMN HEADER
             */}
            <Grid item container xs={1.5}>
              <Grid item xs={12} alignItems="flex-start" textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  PRICE
                </Typography>
              </Grid>
            </Grid>
            {/*
             * BUY COLUMNS HEADER
             */}
            <Grid item container xs={5.25}>
              <Grid item xs={6} alignItems="flex-start" textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  DEPTH(BEAN)
                </Typography>
              </Grid>
              <Grid item xs={6} alignItems="flex-end" textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  {isMinMax ? 'MAX' : 'AVG'} PLACE IN <br />
                  LINE (BUY)
                </Typography>
              </Grid>
            </Grid>
            {/*
             * SELL COLUMNS HEADER
             */}
            <Grid item container xs={5.25}>
              <Grid item xs={6} alignItems="flex-start">
                <Typography variant="caption" color="text.secondary">
                  {isMinMax ? 'MIN' : 'AVG'} PLACE IN <br />
                  LINE (SELL)
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
          {filteredData && filteredData.length ? (
            <Box
              sx={{
                height: tableHeight,
                overflow: 'auto',
                ...scrollbarStyles,
              }}
            >
              {filteredData.map(([priceKey, bucket]) => (
                <Stack key={priceKey}>
                  <Grid container direction="row" spacing={0.8}>
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
                        <Typography
                          variant="caption"
                          sx={{ color: ORDER_GREEN }}
                        >
                          {displayBN(bucket.depth.bean)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} alignItems="flex-end" textAlign="right">
                        <Typography
                          variant="caption"
                          sx={{ color: ORDER_GREEN }}
                        >
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
                        <Typography
                          variant="caption"
                          sx={{ color: LISTING_RED }}
                        >
                          {displayBN(
                            isMinMax
                              ? bucket.placeInLine.sell.min
                              : bucket.placeInLine.sell.avg
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} alignItems="flex-end" textAlign="right">
                        <Typography
                          variant="caption"
                          sx={{ color: LISTING_RED }}
                        >
                          {displayBN(bucket.depth.pods)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Stack>
              ))}
            </Box>
          ) : (
            <Centered>
              <CircularProgress />
            </Centered>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default OrderBook;
