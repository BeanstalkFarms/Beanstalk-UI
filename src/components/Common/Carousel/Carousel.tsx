import React, { useMemo } from 'react';

import { Stack, SxProps, Theme } from '@mui/material';
import { animated, useTransition } from 'react-spring';
import PaginationControl from '../PaginationControl';
import {
  CarouselConfigProps,
  CarouselProvider,
  useCarousel,
  CarouselProps,
} from './CarouselProvider';

const useCarouselConfig = ({
  disableSlide = false,
  disableFade = false,
  duration = 200,
  override = undefined,
}: CarouselConfigProps) => {
  const { direction, springRef, page } = useCarousel();

  const overrideConfig = useMemo(() => {
    if (!override) return undefined;
    const { config, configKeys } = override;
    if (override.config instanceof Function) {
      if (!configKeys) return config();
      return config({ direction: direction, page: page });
    }
    return config;
  }, [direction, override, page]);

  const config = useMemo(() => {
    if (overrideConfig) return overrideConfig;

    const NO_TRANSITION = 'translateX(0%)';

    return {
      initial: {
        opacity: 1,
        transform: NO_TRANSITION,
      },
      from: {
        opacity: !disableFade ? 0 : 1,
        transform: !disableSlide
          ? `translateX(${direction === 'right' ? '100%' : '-100%'})`
          : NO_TRANSITION,
      },
      enter: {
        opacity: 1,
        transform: NO_TRANSITION,
      },
      leave: {
        opacity: !disableFade ? 0 : 1,
        transform: !disableSlide
          ? `translateX(${direction === 'right' ? '-100%' : '100%'})`
          : NO_TRANSITION,
      },
      exitBeforeEnter: true,
      config: { duration: duration },
    };
  }, [direction, disableFade, disableSlide, duration, overrideConfig]);

  const transitions = useTransition(page, {
    ref: springRef,
    keys: null,
    ...config,
  });

  return transitions;
};

export default function Carousel({ total, children }: CarouselProps) {
  return <CarouselProvider total={total}>{children}</CarouselProvider>;
}

interface CarouselPaginationProps {
  wrapperSx?: React.CSSProperties | SxProps<Theme>;
  sx?: React.CSSProperties | SxProps<Theme>;
}

Carousel.Pagination = function NewCarouselPagination({
  wrapperSx,
  sx,
}: CarouselPaginationProps) {
  const { total, page, updateStep } = useCarousel();
  return (
    <Stack sx={{ position: 'relative', ...wrapperSx }}>
      <Stack sx={{ ...sx }}>
        <PaginationControl total={total} page={page} onPageClick={updateStep} />
      </Stack>
    </Stack>
  );
};

interface CarouselElementsProps extends CarouselConfigProps {
  elements: JSX.Element[];
  sx?: React.CSSProperties | SxProps<Theme>;
}

Carousel.Elements = function NewCarouselElements({
  elements,
  sx,
  disableSlide = false,
  disableFade = false,
  duration = 200,
  override = undefined,
}: CarouselElementsProps) {
  const transitions = useCarouselConfig({
    disableSlide,
    disableFade,
    duration,
    override,
  });

  return (
    <Stack width="100%" sx={{ overflow: 'hidden', ...sx }}>
      {transitions((style, i) => (
        <animated.div key={i} style={style}>
          {elements[i]}
        </animated.div>
      ))}
    </Stack>
  );
};
