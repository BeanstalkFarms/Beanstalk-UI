import { CircularProgress, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import CondensedCard from '~/components/Common/Card/CondensedCard';
import Row from '~/components/Common/Row';
import SelectionGroup from '~/components/Common/SingleSelectionGroup';
import ToggleGroup from '~/components/Common/ToggleGroup';
import Centered from '~/components/Common/ZeroState/Centered';
import useOrderbook, {
  OrderbookAggregation,
  OrderbookPrecision,
} from '~/hooks/beanstalk/useOrderbook';
import { scrollbarStyles } from './common/tableStyles';
import OrderBookRow from './tables/OrderbookRow';
import OrderbookTableHeader from './tables/OrderbookTableHeader';

const precisionOptions: OrderbookPrecision[] = [0.01, 0.02, 0.05, 0.1];

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
        height={{ xs: 300, lg: '100%' }}
        py={1}
        sx={{
          borderTop: '0.5px solid',
          borderColor: 'divider',
          ...scrollbarStyles,
        }}
      >
        <OrderbookTableHeader isMinMax={aggregation === 'min-max'} />
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
              <OrderBookRow
                priceKey={priceKey}
                bucket={bucket}
                isMinMax={aggregation === 'min-max'}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </CondensedCard>
  );
};

export default OrderBook;
