import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setUnclaimedWinterNFTs,
  setUnclaimedNFTs,
  setClaimedNFTs,
  setNFTs,
} from 'state/nfts/actions';
import {
  queryWinterNFTs,
  loadNFTs,
  loadWinterNFTs,
  queryAccountNFTStats,
} from 'graph';
import {
  listenForNFTTransfers,
  metamaskFailure,
  account,
  getMintedNFTs,
} from 'util/index';

export default function NFTUpdater() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkMints(data) {
      const [ownedIds, tradedIds] = await getMintedNFTs();
      const un = [];
      const cn = [];
      for (let i = 0; i < data.length; i += 1) {
        if (ownedIds.includes(data[i].id)) {
          if (!tradedIds.includes(data[i].id)) {
            cn.push(data[i]);
          } else {
            const idx = tradedIds.indexOf(data[i].id);
            tradedIds.splice(idx, 1);
          }
        } else {
          un.push(data[i]);
        }
      }
      dispatch(setUnclaimedNFTs(un));
      dispatch(setClaimedNFTs(cn));
      listenForNFTTransfers(loadAccountNFTs); // eslint-disable-line
    }
    async function loadAccountNFTs() {
      const data = await loadNFTs(account.toLowerCase());
      checkMints(data);
    }

    async function loadWinterAccountNFTs() {
      const winterData = await loadWinterNFTs(account.toLowerCase());
      dispatch(setUnclaimedWinterNFTs(winterData));
    }

    async function loadAccountNFTStats() {
      const data = await queryAccountNFTStats(account.toLowerCase());
      dispatch(setNFTs(data));
    }
    async function loadNftLeaderboard() {
      const n = await queryWinterNFTs();
      dispatch(setNFTs(n));
    }

    async function start() {
      if (!account && metamaskFailure === -1) {
        setTimeout(() => start(), 100);
      } else if (account) {
        loadAccountNFTs();
        loadWinterAccountNFTs();
        loadAccountNFTStats();
      }
      loadNftLeaderboard();
    }

    start();

    // eslint-disable-next-line
  }, []);

  return null;
}
