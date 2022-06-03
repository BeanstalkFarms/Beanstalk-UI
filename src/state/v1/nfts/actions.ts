import { createAction } from '@reduxjs/toolkit';

export const setUnclaimedWinterNFTs = createAction<Array>(
  'nfts/setUnclaimedWinterNFTs'
);

export const setUnclaimedNFTs = createAction<Array>(
  'nfts/setUnclaimedNFTs'
);

export const setClaimedNFTs = createAction<Array>(
  'nfts/setClaimedNFTs'
);

export const setClaimedWinterNFTs = createAction<Array>(
  'nfts/setClaimedWinterNFTs'
);

export const setAccountNFTs = createAction<Array>(
  'nfts/setAccountNFTs'
);

export const setInvestmentNFTs = createAction<Array>(
  'nfts/setInvestmentNFTs'
);

export const setNFTs = createAction<Number>(
  'nfts/setNFTs'
);