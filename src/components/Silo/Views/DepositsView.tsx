import React, { useMemo } from 'react';
import { TabData } from '~/components/Silo/Views';
import SeasonPlot from '~/components/Common/Charts/SeasonPlot';
import { SeasonalFarmerDepositedBdvDocument, SeasonalFarmerDepositedBdvQuery } from '~/generated/graphql';
import { toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import useAccount from '~/hooks/ledger/useAccount';

// ------------------------------------------------

const getValue = (season: SeasonalFarmerDepositedBdvQuery['seasons'][number]) => toTokenUnitsBN(season.totalDepositedBDV, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toFixed(0)}`;
const StatProps : (React.ComponentProps<typeof SeasonPlot>)['StatProps'] = {
  title: 'Deposited BDV',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
};
const LineChartProps : React.ComponentProps<typeof SeasonPlot>['LineChartProps'] = {
  curve: 'stepAfter',
};

const DepositsView: React.FC<TabData> = ({ season, current, series }) => {
  const account = useAccount();
  const queryConfig = useMemo(() => ({
    variables: {
      account: account,
    }
  }), [account]);
  if (!account) return null;

  /// get price of bean per season
  /// let totalFiatValue = 0;
  ///
  /// for each Whitelisted Token:
  ///   query: siloAsset = "[FARMER ADDRESS]-[TOKEN ADDRESS]"
  ///   get totalAmountDeposited
  ///   for each season:
  ///     totalFiatValue += useSiloTokenToFiat(TOKEN_ADDRESS, totalAmountDeposited[this season])

  return (
    <SeasonPlot
      document={SeasonalFarmerDepositedBdvDocument}
      height={300}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      LineChartProps={LineChartProps}
      queryConfig={queryConfig}
    />
  );
};

export default DepositsView;

// <>
// <Box sx={{ px: 2 }}>
//   <Stat
//     title="Total Silo Deposits"
//     subtitle={`Season ${displayBN(season)}`}
//     amount={displayUSD(displayValue[0])}
//     color="primary"
//     amountIcon={undefined}
//     gap={0.25}
//     sx={{ ml: 0 }}
//   />
// </Box>
// <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
//   {!account ? (
//     <BlurComponent>
//       <Stack justifyContent="center" alignItems="center" gap={1}>
//         <Typography variant="body1" color="gray">Your Silo Deposits will appear here.</Typography>
//         <WalletButton showFullText color="primary" sx={{ height: 45 }} />
//       </Stack>
//     </BlurComponent>
//   ) : (
//     (breakdown.totalValue?.eq(0)) ? (
//       <BlurComponent>
//         <Stack justifyContent="center" alignItems="center" gap={1} px={1}>
//           <Typography variant="body1" color="gray">Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every season.</Typography>
//         </Stack>
//       </BlurComponent>
//     ) : (
//       <BlurComponent blur={6}>Historical Deposit value will be available soon.</BlurComponent>
//     )
//   )}
//   <LineChart
//     series={series}
//     onCursor={handleCursor}
//   />
// </Box>
// </>
