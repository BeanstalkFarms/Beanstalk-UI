import BigNumber from 'bignumber.js';
import Web from 'web3';
import { beaNFTContract, beaNFTContractReadOnly, txCallback } from './index';

export const mintNFT = async (_account, nftId, ipfsHash, signature) => {
  beaNFTContract()
    .mint(_account, nftId, ipfsHash, signature)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
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

export const isMinted = async (nftId, _ethereum) => {
  const web3 = new Web3(_ethereum);
  try {
    await beaNFTContractReadOnly(web3).ownerOf(new BigNumber(nftId));
    return true;
  } catch {
    return false;
  }
};

export const getMintedNFTs = async (account, _ethereum) => {
  const web3 = new Web3(_ethereum);
  const beaNFT = beaNFTContractReadOnly(web3);
  const toTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { to: account },
    fromBlock: 0,
  });
  const fromTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { from: account },
    fromBlock: 0,
  });
  const ownedIds = toTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  const tradedIds = fromTransfers.map((t) =>
    parseInt(t.returnValues.tokenId, 10)
  );
  return [ownedIds, tradedIds];
};

export const listenForNFTTransfers = async (callback, account, _ethereum) => {
  const web3 = new Web3(_ethereum);
  const beaNFT = beaNFTContractReadOnly(web3);
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
