import BigNumber from 'bignumber.js';
import {
  account,
  beaNFTContract,
  beaNFTContractReadOnly,
  beaNFTGenesisContract,
  beaNFTGenesisContractReadOnly,
  txCallback,
} from './index';

export const mintGenesisNFT = async (_account, nftId, ipfsHash, signature) => {
  beaNFTGenesisContract()
    .mint(_account, nftId, ipfsHash, signature)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const mintNFT = async (_account, nftId, signature) => {
  beaNFTContract()
  .mint(_account, nftId, signature)
  .then((response) => {
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const mintAllNFTs = async (_account, nftId, ipfsHash, signature) => {
  beaNFTGenesisContract()
    .batchMint(_account, nftId, ipfsHash, signature)
    .then((response) => {
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const mintAllAccountNFTs = async (nftIds, signatures) => {
  beaNFTContract()
  .batchMintAccount(account, nftIds, signatures)
  .then((response) => {
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const isMinted = async (nftId) => {
  try {
    await beaNFTGenesisContractReadOnly().methods.ownerOf(new BigNumber(nftId)).call();
    return true;
  } catch {
    return false;
  }
};

export const getMintedWinterNFTs = async () => {
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
  const tradedIds = fromTransfers.map((t) =>
    parseInt(t.returnValues.tokenId, 10)
  );
  return [ownedIds, tradedIds];
};
export const getMintedNFTs = async () => {
  const beaNFT = beaNFTGenesisContractReadOnly();
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
  const beaNFT = beaNFTGenesisContractReadOnly();
  beaNFT.events.allEvents(
    {
      fromBlack: 'latest',
      filter: { to: account },
    },
    () => {
      callback();
    }
  );

  const beaNFT2 = beaNFTGenesisContractReadOnly();
  beaNFT2.events.allEvents(
    {
      fromBlack: 'latest',
      filter: { to: account },
    },
    () => {
      callback();
    }
  );
};
