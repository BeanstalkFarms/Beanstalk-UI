import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { MEDIUM_NFT_LINK, NFT_LINK, OPENSEA_LINK } from 'constants/index';
import {
  listenForNFTTransfers,
  GetWalletAddress,
  getMintedNFTs,
} from 'util/index';
import { beanftStrings, ContentSection } from 'components/Common';
import ClaimNFT from './claimnft';

export default function NFTs() {
  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const [unclaimedNFTs, setUnclaimedNFTs] = useState([]);
  const [claimedNFTs, setClaimedNFTs] = useState([]);

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
      setUnclaimedNFTs(un);
      setClaimedNFTs(cn);
      listenForNFTTransfers(getNFTs); // eslint-disable-line
    }
    async function getNFTs() {
      fetch(`${NFT_LINK}?account=${(await GetWalletAddress()).toLowerCase()}`)
        .then((response) => response.json())
        .then((data) => {
          data.forEach((d) => {
            d.id = parseInt(d._id.$numberInt, 10);
            delete d._id;
          });
          checkMints(data);
        });
    }
    getNFTs();
  }, [season]);

  const descriptionLinks = [
    {
      href: `${OPENSEA_LINK}`,
      text: 'OpenSea',
    },
    {
      href: `${MEDIUM_NFT_LINK}`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection
      id="nft"
      title="BeaNFTs"
      textTransform="none"
      style={{ minHeight: '100px' }}
      description={beanftStrings.beanftDescription}
      descriptionLinks={descriptionLinks}
    >
      <ClaimNFT
        buttonDescription={beanftStrings.mintAll}
        claimTitle="MINT ALL"
        claimedNfts={claimedNFTs}
        nfts={unclaimedNFTs}
      />
    </ContentSection>
  );
}
