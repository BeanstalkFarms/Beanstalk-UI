import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUnclaimedNFTs,
  setClaimedNFTs,
  setAccountNFTs,
  setNumNFTs,
} from 'state/nfts/actions';
import { beanNFTSowQuery, loadNFTs } from 'graph';
import { AppState } from 'state';
import {
  listenForNFTTransfers,
  GetWalletAddress,
  getMintedNFTs,
} from 'util/index';

export default function NFTUpdater() {
  const dispatch = useDispatch();

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );

  useEffect(() => {
    let count = 0;

    async function checkMints(data) {
      const [ownedIds, tradedIds] = await getMintedNFTs();
      const un = [];
      const cn = [];
      for (let i = 0; i < data.length; i += 1) {
        if (ownedIds.includes(data[i].id)) {
          if (!tradedIds.includes(data[i].id)) {
            cn.push(data[i]);
            count += 1;
          } else {
            const idx = tradedIds.indexOf(data[i].id);
            tradedIds.splice(idx, 1);
          }
        } else {
          un.push(data[i]);
          count += 1;
        }
      }
      dispatch(setUnclaimedNFTs(un));
      dispatch(setClaimedNFTs(cn));
      dispatch(setNumNFTs(count));
      listenForNFTTransfers(getNFTs); // eslint-disable-line
    }
    async function getNFTs(acct) {
      const data = await loadNFTs(acct.toLowerCase());
      checkMints(data);
    }
    async function loadAccountsData() {
      const [a] = await Promise.all([
        beanNFTSowQuery(season.toString()),
      ]);
      dispatch(setAccountNFTs(a));
    }

    async function start() {
      GetWalletAddress().then((result) => {
        getNFTs(result.toLowerCase());
      });
      loadAccountsData();
    }

    start();

    // eslint-disable-next-line
  }, []);

  return null;
}
