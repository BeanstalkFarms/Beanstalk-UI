import BigNumber from 'bignumber.js';
import {
  account,
  beaNFTContract,
  beaNFTContractReadOnly,
  txCallback,
} from './index';

export const mintNFT = async (_account, nftId, ipfsHash, signature) => {
  beaNFTContract()
    .mint(_account, nftId, ipfsHash, signature)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const mintNFT2 = async (_account, nftId, signature) => {
  console.log(_account, nftId, signature);
};

export const mintAllNFTs = async (_account, nftId, ipfsHash, signature) => {
  beaNFTContract()
    .batchMint(_account, nftId, ipfsHash, signature)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const mintAllAccountNFTs = async (nftIds, signatures) => {
  console.log(account, nftIds, signatures);
};

export const isMinted = async (nftId) => {
  try {
    await beaNFTContractReadOnly().methods.ownerOf(new BigNumber(nftId)).call();
    return true;
  } catch {
    return false;
  }
};

export const getMintedWinterNFTs = async () => [[], []];

export const getMintedNFTs = async () => {
  const beaNFT = beaNFTContractReadOnly();
  const toTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { to: account },
    fromBlock: 0,
  });
  const fromTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { from: account },
    fromBlock: 0,
  });
  const ownedIds = toTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  const tradedIds = fromTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  return [ownedIds, tradedIds];
};

export const listenForNFTTransfers = async (callback) => {
  const beaNFT = beaNFTContractReadOnly();
  beaNFT.events.allEvents(
    {
      fromBlack: 'latest',
      filter: { to: account },
    },
    () => {
      callback();
    }
  );
};
