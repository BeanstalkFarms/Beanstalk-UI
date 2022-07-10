import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Container, Divider, Stack, Tab, Tabs, Typography, } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useAccount } from 'wagmi';
import fetch from 'node-fetch';
import NFTDialog from '../components/NFT/NFTDialog';
import WalletCard from '../components/NFT/WalletCard';
import { loadNFTs } from '../graph';
import { BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES } from '../constants';
import NFTGrid from '../components/NFT/NFTGrid';
import { ClaimStatus } from '../util/BeaNFTs';

type Nft = {
  id: number;
  metadataIpfsHash?: string;
  imageIpfsHash?: string;
  signature?: string;
  account: string;
  subcollection: string;
  /** 0 => claimed, 1 => unclaimed  */
  claimed?: ClaimStatus;
}

const NFTPage: React.FC = () => {
  const { data: account } = useAccount();

  // component state
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // NFT state
  const [selectedNFT, setSelectedNFT] = useState<Nft | null>(null);
  const [genesisNFTs, setGenesisNFTs] = useState<Nft[] | null>(null);
  const [winterNFTs, setWinterNFTs] = useState<Nft[] | null>(null);

  // handlers
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleDialogOpen = (nft: Nft) => {
    setSelectedNFT(nft);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedNFT(null);
    setDialogOpen(false);
  };

  const parseMints = useCallback((accountNFTs: any, contractAddress: string, setNFTs: any) => {
    const requestOptions: any = {
      method: 'GET',
      redirect: 'follow'
    };

    const nfts: Nft[] = [];
    const baseURL = 'https://eth-mainnet.alchemyapi.io/nft/v2/demo/getNFTs/';
    const ownerAddr = account?.address?.toLowerCase();
    const fetchURL = `${baseURL}?owner=${ownerAddr}&contractAddresses[]=${contractAddress}`;

    fetch(fetchURL, requestOptions)
      .then((response) => response.json())
      .then((response) => {
        // hashes of only user's claimed nfts
        const nftHashes = response.ownedNfts.map((nft: any) => nft.metadata.image.replace('ipfs://', ''));
        for (let i = 0; i < accountNFTs.length; i += 1) {
          if (nftHashes.includes(accountNFTs[i].imageIpfsHash)) {
            nfts.push({ ...accountNFTs[i], claimed: ClaimStatus.CLAIMED });
          } else {
            nfts.push({ ...accountNFTs[i], claimed: ClaimStatus.UNCLAIMED });
          }
        }
        setNFTs(nfts);
      });
  }, [account?.address]);

  useEffect(() => {
    if (account?.address !== undefined) {
      // FIXME: move this to a datastore and fetch with an API
      // gets all BeaNFTs (claimed & unclaimed) from parsed-accounts.json
      loadNFTs(account.address.toLowerCase()).then((data) => {
        const genNFTs = data.genesis;
        const winNFTs = data.winter;

        parseMints(genNFTs, BEANFT_GENESIS_ADDRESSES[1], setGenesisNFTs);
        parseMints(winNFTs, BEANFT_WINTER_ADDRESSES[1], setWinterNFTs);
      });
    }
  }, [account?.address, parseMints]);

  if (account?.address === undefined) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title={
            <>
              <strong>BeaNFTs</strong>
            </>
          }
          description="View and mint your BeaNFTs"
        />
        <Card sx={{ p: 2 }}>
          <Stack gap={1}>
            <Typography variant="h2">My BeaNFTs</Typography>
            <WalletCard address={account.address} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
              <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
                <Tab label={`Genesis (${genesisNFTs === null ? 0 : genesisNFTs?.length})`} />
                <Tab label={`Winter (${winterNFTs === null ? 0 : winterNFTs?.length})`} />
              </Tabs>
              {tab === 0 && (
                <Button>Mint All Genesis</Button>
              )}
              {tab === 1 && (
                <Button>Mint All Winter</Button>
              )}
            </Stack>
            <Divider />
            {/* genesis */}
            {tab === 0 && (
              <NFTGrid
                nfts={genesisNFTs}
                handleDialogOpen={handleDialogOpen} />
            )}
            {/* winter */}
            {tab === 1 && (
              <NFTGrid
                nfts={winterNFTs}
                handleDialogOpen={handleDialogOpen}
              />
            )}
          </Stack>
        </Card>
      </Stack>
      {selectedNFT !== null &&
      <NFTDialog
        nft={selectedNFT}
        dialogOpen={dialogOpen}
        handleDialogClose={handleDialogClose}
        address={account.address} />}
    </Container>
  );
};

export default NFTPage;
