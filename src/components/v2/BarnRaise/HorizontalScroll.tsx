/* eslint-disable */
import React from 'react';
import { Card, Divider, Link, Stack, Typography } from '@mui/material';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { makeStyles } from '@mui/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import beanCircleIcon from 'img/bean-circle.svg';
import fertilizerOpenedIcon from 'img/fertilizer-opened.svg';
import {ERC20Token, NativeToken} from "../../../classes/Token";

const useStyles = makeStyles(() => ({
  scrollMenu: {
    alignItems: 'center'
  }
}));

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
    React.useContext(VisibilityContext);

  return (
    <ChevronLeftIcon cursor="pointer" onClick={() => scrollPrev()} />
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

  return (
    <ChevronRightIcon cursor="pointer" onClick={() => scrollNext()} />
  );
}

function ScrollItem({ 
  onClick,
  selected,
  title,
  itemId
}: { 
  onClick: any,
  selected: any,
  title: any, 
  itemId: any
}) {
  const visibility = React.useContext(VisibilityContext);
  return (
    <Stack
      onClick={() => onClick(visibility)}
      style={{
        width: '160px',
      }}
      tabIndex={0}
      sx={{ mr: 1, ml: 1 }}
    >
      <Stack alignItems="left">
        <Typography sx={{ fontSize: '18px', ml: 1 }}>Season 5192</Typography>
      </Stack>
      <Stack alignItems="center">
        <Stack alignItems="center">
          <img alt="" src={fertilizerOpenedIcon} width="150px" />
        </Stack>
      </Stack>
      <Stack alignItems="center" gap={0.5} sx={{ pt: 1 }}>
        <Typography sx={{ fontSize: '18px' }}>x 10,000</Typography>
        <Typography sx={{ fontSize: '18px' }}>500% Humidity</Typography>
        <Stack direction="row" gap={0.2}>
          <img alt="" src={beanCircleIcon} width="16px" />
          <Typography sx={{ fontSize: '18px' }}>100</Typography>
          <Typography sx={{ fontSize: '18px' }}>/</Typography>
          <img alt="" src={beanCircleIcon} width="16px" />
          <Typography sx={{ fontSize: '18px' }}>50,000</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

export interface HorizontalScrollProps {
  items: any;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ items }) => {
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [position, setPosition] = React.useState(0);
  const isItemSelected = (id: string) => !!selected.find((el) => el === id);

  const handleClick =
    (id: any) =>
      ({ getItemById, scrollToItem }: { getItemById: any, scrollToItem: any }) => {
        const itemSelected = isItemSelected(id);
        setSelected((currentSelected) =>
          (itemSelected
            ? currentSelected.filter((el) => el !== id)
            : currentSelected.concat(id))
        );
      };

  return (
    <Card sx={{ p: 2 }}>
      <Stack>
        <Stack gap={1}>
          <Typography variant="h6">My Active Fertilizer</Typography>
          <Stack gap={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Unclaimed Beans:</Typography>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Stack direction="row" gap={0.2}>
                  <img alt="" src={beanCircleIcon} width="16px" />
                  <Typography>200</Typography>
                </Stack>
                <Link underline="none" href="#"><Typography>(Claim)</Typography></Link>
                <Typography>or</Typography>
                <Link underline="none" href="#"><Typography>(Claim & Deposit)</Typography></Link>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Total Fertilizer Reward:</Typography>
              <Stack direction="row" alignItems="center" gap={0.1}>
                <img alt="" src={beanCircleIcon} width="16px" />
                <Typography>100,000</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Total Owed Beans:</Typography>
              <Stack direction="row" alignItems="center" gap={0.1}>
                <img alt="" src={beanCircleIcon} width="16px" />
                <Typography>100,000</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ color: '#c7ddf0' }} />
          </Stack>
        </Stack>
        <Stack sx={{ pt: 2, pb: 1 }} gap={3}>
          <ScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={RightArrow}
            wrapperClassName={classes.scrollMenu}
          >
            {items.map(({ id }: { id: any }) => (
              <ScrollItem
                itemId={id} // NOTE: itemId is required for track items
                title={id}
                key={id}
                onClick={handleClick(id)}
                selected={isItemSelected(id)}
              />
            ))}
          </ScrollMenu>
          <Stack>
            <Link
              href="#"
              // target="_blank"
              underline="none"
              rel="noreferrer"
            >
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                View All Fertilizer
              </Typography>
            </Link>
            {/* <Typography sx={{ opacity: 0.7 }}>Learn More About The Barn Raise</Typography> */}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default HorizontalScroll;
