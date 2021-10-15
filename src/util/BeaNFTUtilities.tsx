import BigNumber from 'bignumber.js';
import {
  account,
  beaNFTContract,
  beaNFTContractReadOnly,
  txCallback,
} from './index';

export const mintNFT = async (account, nftId, ipfsHash, signature) => {
  beaNFTContract()
    .mint(account, nftId, ipfsHash, signature)
    .then(response => {
      response.wait().then(receipt => {
        txCallback();
      });
    });
};

export const mintAllNFTs = async (account, nftId, ipfsHash, signature) => {
  beaNFTContract()
    .batchMint(account, nftId, ipfsHash, signature)
    .then(response => {
      response.wait().then(receipt => {
        txCallback();
      });
    });
};

export const isMinted = async nftId => {
  try {
    await beaNFTContractReadOnly().methods.ownerOf(new BigNumber(nftId)).call();
    return true;
  } catch {
    return false;
  }
};

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
  const ownedIds = toTransfers.map(t => parseInt(t.returnValues.tokenId));
  const tradedIds = fromTransfers.map(t => parseInt(t.returnValues.tokenId));
  return [ownedIds, tradedIds];
};

export const listenForNFTTransfers = async callback => {
  const beaNFT = beaNFTContractReadOnly();
  beaNFT.events.allEvents(
    {
      fromBlack: 'latest',
      filter: { to: account },
    },
    (error, event) => {
      callback();
    },
  );
};
