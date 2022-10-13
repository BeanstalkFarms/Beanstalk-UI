import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { BeanstalkPalette, FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import { ZERO_BN } from '~/constants';
import { SEEDS, STALK } from '~/constants/tokens';
import useDimensions from '~/hooks/app/useDimensions';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import BalancePopper from './BalancePopper';

const colors = [
  BeanstalkPalette.logoGreen,
  '#C8EACC',
  BeanstalkPalette.theme.fall.brown,
];

const SVG_HEIGHT = 52;
const RECT_HEIGHT_RATIO = 1 / 3;
const RATIOS = [0.55, 0.2, 0.25];
const strokeInterval = 4;

const asPct = (num: number) => `${num}%`;

const StalkSVG: React.FC<{
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const size = useDimensions(containerRef);

  const rectHeight = SVG_HEIGHT * RECT_HEIGHT_RATIO;
  const rectYPos = SVG_HEIGHT - rectHeight;

  const { svgItems, lines } = useMemo(() => {
    const styles: { startX: number; width: number; color: string }[] = [];
    let acc = 0;
    RATIOS.forEach((r, i) => {
      styles.push({
        startX: acc * 100,
        width: r * 100,
        color: colors[i],
      });
      if (i !== RATIOS.length - 1) {
        acc += r;
      }
    });

    const last = styles[styles.length - 1];
    const pctPerPx = 100 / size.width;
    const numLines = Math.ceil(last.width / (pctPerPx * strokeInterval));

    const _lines = Array(numLines)
      .fill(null)
      .map((_d: null, i) =>
        asPct(last.startX + pctPerPx * strokeInterval * (i + 1))
      );

    return { svgItems: styles, lines: _lines };
  }, [size]);

  return (
    <svg
      height={`${SVG_HEIGHT}`}
      preserveAspectRatio="xMinYMin meet"
      viewBox={`0 0 ${size.width} ${SVG_HEIGHT}`}
    >
      {svgItems.map(({ startX, width, color }, i) => (
        <g fill={color} stroke={color} strokeWidth={1} key={`g-${i}`}>
          <line x1={asPct(startX)} x2={asPct(startX)} y1={0} y2={SVG_HEIGHT} />
          {i !== svgItems.length - 1 ? (
            <rect
              x={asPct(startX)}
              y={rectYPos}
              width={asPct(width)}
              height={SVG_HEIGHT}
            />
          ) : (
            lines.map((xPos, k) => (
              <line
                key={`${k}-line`}
                x1={xPos}
                x2={xPos}
                y1={rectYPos}
                y2={SVG_HEIGHT}
              />
            ))
          )}
        </g>
      ))}
    </svg>
  );
};

const StalkAndSeedsBalance: React.FC<{}> = () => {
  const { stalk: farmerStalk, seeds: farmerSeeds } = useSelector<
    AppState,
    AppState['_farmer']['silo']
  >((state) => state._farmer.silo);
  const { stalk: beanstalkStalk } = useSelector<
    AppState,
    AppState['_beanstalk']['silo']
  >((state) => state._beanstalk.silo);

  const container = useRef<HTMLDivElement | null>(null);

  const ownership =
    farmerStalk?.active.gt(0) && beanstalkStalk.total?.gt(0)
      ? farmerStalk.active.div(beanstalkStalk.total)
      : ZERO_BN;

  const items = [
    {
      title: 'STALK',
      token: STALK,
      amount: farmerStalk.total,
      pct: ownership,
      description:
        'Stalk entitles the holder to a share of future Bean mints and participation in governance.',
    },
    {
      title: 'SEEDS',
      token: SEEDS,
      amount: farmerSeeds.total,
      description: 'Seeds yield 1/10000 Grown Stalk every Season.',
    },
  ];

  const stalkInfo = [
    {
      amount: farmerStalk.active,
      text: 'from initial deposits',
    },
    {
      amount: farmerStalk.grown,
      text: 'grown from Seeds',
    },
    {
      amount: farmerStalk.total.dividedBy(10_000),
      text: 'per Season from Seeds',
    },
  ];

  return (
    <BalancePopper items={items} maxWidth={490}>
      <Stack sx={{ px: 2, pb: 2 }} spacing={2}>
        <Stack spacing={0.5}>
          {stalkInfo.map(({ amount, text }, i) => (
            <Row spacing={0.5} sx={{ width: '100%' }} key={i}>
              <Box
                sx={{
                  borderRadius: '50%',
                  background: colors[i],
                  height: '8px',
                  width: '8px',
                }}
              />
              <Typography component="span" variant="bodySmall">
                <Typography variant="bodySmall" fontWeight={FontWeight.bold}>
                  {displayFullBN(amount, 2)}
                </Typography>{' '}
                STALK {text}
              </Typography>
            </Row>
          ))}
        </Stack>
        <div ref={container}>
          <StalkSVG containerRef={container} />
        </div>
      </Stack>
    </BalancePopper>
  );
};

export default StalkAndSeedsBalance;
