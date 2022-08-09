import React from 'react';
import { Box, Card, CardProps, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '~/state';
import { TokenMap, ZERO_BN } from '../../constants';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';
import { SeasonalLiquidityDocument, SeasonalLiquidityQuery } from '~/generated/graphql';
import SeasonPlot from '~/components/Common/Charts/SeasonPlot';
import useSeason from '~/hooks/useSeason';

export type LiquidityOverviewProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}
const getValue = (season: SeasonalLiquidityQuery['seasons'][number]) => parseFloat(season.totalLiquidityUSD);
const formatValue = (value: number) => <Typography variant="h1" color="text.primary">${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>;
  
const useStatProps = () => ({
  title: 'Liquidity',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
});

const LiquidityOverTime: React.FC<LiquidityOverviewProps & CardProps> = ({
  balances,
  sx
}) => {
  // const breakdown = useBeanstalkSiloBreakdown();
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const liquidity = Object.values(beanPools).reduce((prev, curr) => prev.plus(curr.liquidity), ZERO_BN);
  
  const season = useSeason();
  const StatProps = useStatProps();
  const queryConfig = { context: { subgraph: 'bean' } };
  
  return (
    <Card sx={{ width: '100%', pt: 2, ...sx }}>
      {/* <Box sx={{ p: 2 }}> */}
      {/*  <Stat */}
      {/*    title="Total Liquidity" */}
      {/*    amount={<Fiat value={liquidity} amount={liquidity} />} */}
      {/*    amountIcon={undefined} */}
      {/*    gap={0.25} */}
      {/*    sx={{ ml: 0 }} */}
      {/*  /> */}
      {/* </Box> */}
      <Box sx={{ position: 'relative' }}>
        {/* <BlurComponent blur={10} opacity={0.7} sx={{ borderRadius: 1 }}> */}
        {/*  <Typography variant="body1" color="gray">Historical liquidity will be available soon.</Typography> */}
        {/* </BlurComponent> */}
        
        {/* <LiquidityBalances */}
        {/*  balances={balances} */}
        {/* /> */}
        
        <SeasonPlot
          document={SeasonalLiquidityDocument}
          height={300}
          defaultSeason={season?.gt(0) ? season.toNumber() : 0}
          defaultValue={liquidity.toNumber()}
          getValue={getValue}
          formatValue={formatValue}
          StatProps={StatProps}
          queryConfig={queryConfig}
          stackedArea
        />
      </Box>
    </Card>
  );
};

export default LiquidityOverTime;
