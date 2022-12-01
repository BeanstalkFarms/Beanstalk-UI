import { Button, Typography } from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import { FC } from '~/types';
import {
  podsOrderTypeAtom,
  PodOrderType,
  podsOrderActionAtom,
  PodOrderAction,
} from '../info/atom-context';

const SubAction: FC<{ isActive: boolean; onClick: () => void }> = ({
  children,
  isActive,
  onClick,
}) => (
  <Button
    variant="text"
    color="primary"
    onClick={onClick}
    sx={{
      minWidth: 0,
      maxHeight: '23px',
      padding: 0.4,
      color: isActive ? undefined : 'text.primary',
      backgroundColor: isActive ? BeanstalkPalette.lightYellow : undefined,
      ':hover': {
        backgroundColor: isActive ? BeanstalkPalette.lightYellow : undefined,
      },
      borderRadius: 0.4,
    }}
  >
    {children}
  </Button>
);

const SubActionSelect: React.FC<{}> = () => {
  const orderAction = useAtomValue(podsOrderActionAtom);
  const [orderType, setOrderType] = useAtom(podsOrderTypeAtom);

  useEffect(() => {
    if (
      orderAction === PodOrderAction.SELL &&
      orderType === PodOrderType.ORDER
    ) {
      setOrderType(PodOrderType.LIST);
    }
  }, [orderAction, orderType, setOrderType]);

  return (
    <Row gap={0.8}>
      <SubAction
        isActive={orderType !== PodOrderType.FILL}
        onClick={() =>
          setOrderType(
            orderAction === PodOrderAction.BUY
              ? PodOrderType.ORDER
              : PodOrderType.LIST
          )
        }
      >
        <Typography variant="caption">
          {orderAction === PodOrderAction.BUY ? 'ORDER' : 'LIST'}
        </Typography>
      </SubAction>
      <SubAction
        isActive={orderType === PodOrderType.FILL}
        onClick={() => setOrderType(PodOrderType.FILL)}
      >
        <Typography variant="caption">FILL</Typography>
      </SubAction>
    </Row>
  );
};

export default SubActionSelect;
