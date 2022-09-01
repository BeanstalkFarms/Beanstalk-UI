import React, { useCallback, useMemo } from 'react';
import { Token } from '~/classes';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedSiloAssetDocument, SeasonalDepositedSiloAssetQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { toTokenUnitsBN } from '~/util';

const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const DepositedAsset: React.FC<{
  height?: SeasonPlotBaseProps['height'];
  account: string;
  asset: Token;
}> = ({ 
  height,
  account,
  asset
}) => {
  const getValue = useCallback(
    (season: SnapshotData<SeasonalDepositedSiloAssetQuery>) => toTokenUnitsBN(season.totalDepositedAmount, asset.decimals).toNumber(),
    [asset]
  );
  const StatProps = useMemo(() => ({
    title: `Deposited ${asset.symbol}`,
    titleTooltip: `The total number of Deposited ${asset.symbol === 'BEAN' ? 'Beans' : asset.name} Tokens.`,
    gap: 0.5,
  }), [asset]);
  const queryConfig = useMemo(() => ({
    variables: {
      season_gt: 6073,
      siloAsset: `${account.toLowerCase()}-${asset.address}`,
    }
  }), [account, asset]);
  return (
    <SeasonPlot<SeasonalDepositedSiloAssetQuery>
      height={height}
      document={SeasonalDepositedSiloAssetDocument}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      queryConfig={queryConfig}
    />
  );
};

export default DepositedAsset;
