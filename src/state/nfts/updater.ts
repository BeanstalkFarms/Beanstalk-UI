import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setUnclaimedNFTs,
  setClaimedNFTs,
  setClaimedWinterNFTs,
  setUnclaimedWinterNFTs,
  setNFTs,
} from 'state/nfts/actions';
import {
  queryWinterNFTs,
  loadNFTs,
  queryAccountNFTStats,
} from 'graph';
import {
  listenForNFTTransfers,
  metamaskFailure,
  account,
  getMintedNFTs,
  getMintedWinterNFTs,
} from 'util/index';

export default function NFTUpdater() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkMints(data, getMinted, setUnclaimed, setClaimed) {
      const [ownedIds, tradedIds] = await getMinted();
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
      dispatch(setUnclaimed(un));
      dispatch(setClaimed(cn));
      listenForNFTTransfers(loadAccountNFTs); // eslint-disable-line
    }
    async function loadAccountNFTs() {
      const {
        genesis,
        winter,
      } = await loadNFTs(account.toLowerCase());
      checkMints(genesis, getMintedNFTs, setUnclaimedNFTs, setClaimedNFTs);
      checkMints(winter, getMintedWinterNFTs, setUnclaimedWinterNFTs, setClaimedWinterNFTs);
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
        loadAccountNFTStats();
      }
      loadNftLeaderboard();
    }

    start();

    // eslint-disable-next-line
  }, []);

  return null;
}
