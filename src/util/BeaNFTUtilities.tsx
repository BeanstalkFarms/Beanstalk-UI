import BigNumber from 'bignumber.js';
import { DEPLOYMENT_BLOCKS } from 'constants/blocks';
import {
  account,
  beaNFTContract,
  beaNFTContractReadOnly,
  beaNFTGenesisContract,
  beaNFTGenesisContractReadOnly,
  chainId,
  txCallback,
} from './index';

export const mintGenesisNFT = async (_account, nftId, ipfsHash, signature) => {
  return Promise.resolve(null);
  // beaNFTGenesisContract()
  //   .mint(_account, nftId, ipfsHash, signature)
  //   .then((response) => {
  //     response.wait().then(() => {
  //       txCallback();
  //     });
  //   });
};

export const mintNFT = async (_account, nftId, signature) => {
  return Promise.resolve(null);
  // beaNFTContract()
  // .mint(_account, nftId, signature)
  // .then((response) => {
  //   response.wait().then(() => {
  //     txCallback();
  //   });
  // });
};

export const mintAllNFTs = async (_account, nftId, ipfsHash, signature) => {
  return Promise.resolve(null);
  // beaNFTGenesisContract()
  //   .batchMint(_account, nftId, ipfsHash, signature)
  //   .then((response) => {
  //     response.wait().then(() => {
  //       txCallback();
  //     });
  //   });
};

export const mintAllAccountNFTs = async (nftIds, signatures) => {
  return Promise.resolve(null);
  // beaNFTContract()
  // .batchMintAccount(account, nftIds, signatures)
  // .then((response) => {
  //   response.wait().then(() => {
  //     txCallback();
  //   });
  // });
};

/**
 * @rpc 1 call
 */
export const isMinted = async (nftId) => {
  try {
    await beaNFTGenesisContractReadOnly().methods.ownerOf(new BigNumber(nftId)).call();
    return true;
  } catch {
    return false;
  }
};

/**
 * @rpc 2 calls
 */
export const getMintedWinterNFTs = async () => {
  const beaNFT = beaNFTContractReadOnly(true);
  const { BEANSTALK_GENESIS_BLOCK } = DEPLOYMENT_BLOCKS[chainId];
  const toTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { to: account },
    fromBlock: BEANSTALK_GENESIS_BLOCK,
  });
  const fromTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { from: account },
    fromBlock: BEANSTALK_GENESIS_BLOCK,
  });
  const ownedIds = toTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  const tradedIds = fromTransfers.map((t) =>
    parseInt(t.returnValues.tokenId, 10)
  );
  return [ownedIds, tradedIds];
};

/**
 * @rpc 2 calls
 */
export const getMintedNFTs = async () => {
  const beaNFT = beaNFTGenesisContractReadOnly(true);
  const { BEANSTALK_GENESIS_BLOCK } = DEPLOYMENT_BLOCKS[chainId];
  const toTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { to: account },
    fromBlock: BEANSTALK_GENESIS_BLOCK,
  });
  const fromTransfers = await beaNFT.getPastEvents('Transfer', {
    filter: { from: account },
    fromBlock: BEANSTALK_GENESIS_BLOCK,
  });
  const ownedIds = toTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  const tradedIds = fromTransfers.map((t) => parseInt(t.returnValues.tokenId, 10));
  return [ownedIds, tradedIds];
};

// export const listenForNFTTransfers = async (callback) => {
//   const beaNFT = beaNFTGenesisContractReadOnly();
//   beaNFT.events.allEvents(
//     {
//       fromBlack: 'latest',
//       filter: { to: account },
//     },
//     () => {
//       callback();
//     }
//   );

//   const beaNFT2 = beaNFTGenesisContractReadOnly();
//   beaNFT2.events.allEvents(
//     {
//       fromBlack: 'latest',
//       filter: { to: account },
//     },
//     () => {
//       callback();
//     }
//   );
// };
