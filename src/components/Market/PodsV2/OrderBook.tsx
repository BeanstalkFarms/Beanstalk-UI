import { Card, Divider, Stack, Typography } from '@mui/material';
import { atom } from 'jotai';
import React, { useState } from 'react';
import { FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import SelectionGroup from '~/components/Common/SingleSelectionGroup';
import ToggleGroup from '~/components/Common/ToggleGroup';
import useOrderbook, {
  OrderbookAggregation,
  OrderbookPrecision,
} from '~/hooks/beanstalk/useOrderbook';

const precisionOptions: OrderbookPrecision[] = [0.01, 0.02, 0.05, 0.1];

const orderBookAggregatAtom = atom<'min-max' | 'avg'>('min-max');
const precisionAtom = atom<OrderbookPrecision>(precisionOptions[0]);

const OrderBook: React.FC<{}> = () => {
  const [precision, setPrecision] = useState<OrderbookPrecision>(
    precisionOptions[0]
  );
  const [aggregation, setAggregation] =
    useState<OrderbookAggregation>('min-max');
  const data = useOrderbook();

  return (
    <Card sx={{ height: '100%' }}>
      <Stack height="100%" sx={{ overflow: 'hidden', visibility: 'visible' }}>
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
        <Stack px={1.8} py={0.8} />
      </Stack>
    </Card>
  );
};

export default OrderBook;
