import { Stack, SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { animated, useSpringRef, useTransition } from 'react-spring';
import PaginationControl from './PaginationControl';

interface Props {
  elements: JSX.Element[];
  hidePaginationControl?: boolean;
  paginationSx?: React.CSSProperties | SxProps<Theme>;
}

const Carousel: React.FC<Props> = ({
  elements,
  hidePaginationControl,
  paginationSx,
}) => {
  const [page, setPage] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const transRef = useSpringRef();
  const transitions = useTransition(page, {
    ref: transRef,
    keys: null,
    initial: {
      opacity: 1,
      transform: 'translateX(0%)',
    },
    from: {
      opacity: 0,
      transform: `translateX(${direction === 'right' ? '-100%' : '100%'})`,
    },
    enter: {
      opacity: 1,
      transform: 'translateX(0%)',
    },
    leave: {
      opacity: 0,
      transform: `translateX(${direction === 'right' ? '100%' : '-100%'})`,
    },
    exitBeforeEnter: true,
    config: { duration: 200 },
  });

  useEffect(() => {
    transRef.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onPageClick = useCallback(
    (val: number) => {
      if (val < 0 || val >= elements.length) return;
      setDirection(val > page ? 'right' : 'left');
      setPage(val);
    },
    [elements.length, page]
  );

  return (
    <Stack width="100%" sx={{ overflow: 'hidden' }}>
      {transitions((style, i) => (
        <animated.div style={{ ...style }} key={i}>
          {elements[i]}
        </animated.div>
      ))}
      {!hidePaginationControl && (
        <Stack sx={{ position: 'relative' }} width="100%">
          <Stack sx={paginationSx}>
            <PaginationControl
              total={elements.length}
              onPageClick={onPageClick}
              page={page}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default Carousel;
