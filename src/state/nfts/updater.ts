import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUnclaimedNFTs, setClaimedNFTs, setNFTs } from 'state/nfts/actions';
import { queryWinterNFTs, loadNFTs, queryAccountNFTStats } from 'graph';
import { listenForNFTTransfers, getMintedNFTs } from 'util/index';
import { useAccount, useEthereum } from 'state/application/hooks';

export default function NFTUpdater() {
  const dispatch = useDispatch();
  const account = useAccount();
  const ethereum = useEthereum();

  useEffect(() => {
    async function checkMints(data) {
      const [ownedIds, tradedIds] = await getMintedNFTs(account, ethereum);
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
      listenForNFTTransfers(loadAccountNFTs, account, ethereum); // eslint-disable-line
    }
    async function loadAccountNFTs() {
      const data = await loadNFTs(account.toLowerCase());
      checkMints(data);
    }

    async function loadAccountNFTStats() {
      const data = await queryAccountNFTStats(account.toLowerCase());
      dispatch(setNFTs(data));
    }
    async function loadWinterNFTs() {
      const n = await queryWinterNFTs();
      dispatch(setNFTs(n));
    }

    async function start() {
      if (!account) {
        setTimeout(() => start(), 100);
      } else if (account) {
        loadAccountNFTs();
        loadAccountNFTStats();
      }
      loadWinterNFTs();
    }

    start();

    // eslint-disable-next-line
  }, []);

  return null;
}
