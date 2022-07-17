import BigNumber from 'bignumber.js';

export type SeasonMap<T> = {
  [season: string]: T;
};

export type PlotMap<T> = {
  [index: string]: T;
};

export type Field = {
  plots: PlotMap<BigNumber>;
  pods: BigNumber;
  harvestablePlots: PlotMap<BigNumber>;
  harvestablePods: BigNumber;
};
