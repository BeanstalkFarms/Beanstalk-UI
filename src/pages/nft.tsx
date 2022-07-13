import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Container, Divider, Stack, Tab, Tabs, Typography, } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useAccount, useSigner } from 'wagmi';
import fetch from 'node-fetch';
import NFTDialog from '../components/NFT/NFTDialog';
import WalletCard from '../components/NFT/WalletCard';
import { BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES } from '../constants';
import NFTGrid from '../components/NFT/NFTGrid';
import { useGenesisNFTContract, useWinterNFTContract } from '../hooks/useContract';
import { BeaNFTGenesis, BeaNFTWinter } from '../generated';
import { getAccount } from 'util/Account';
import { ClaimStatus, loadNFTs, Nft } from 'util/BeaNFTs';

const NFTPage: React.FC = () => {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const   genesisContract = useGenesisNFTContract(signer);
  const winterContract = useWinterNFTContract(signer);

  // component state
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // NFT state
  const [selectedNFT, setSelectedNFT] = useState<Nft | null>(null);
  const [genesisNFTs, setGenesisNFTs] = useState<Nft[] | null>(null);
  const [winterNFTs, setWinterNFTs]   = useState<Nft[] | null>(null);

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
        console.debug(`[parseMints] response: `, response);
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

  // TODO: not working
  const mintAllGenesis = () => {
    if (account?.address && genesisNFTs) {
      const unminted = genesisNFTs.filter((nft) => nft.claimed === ClaimStatus.UNCLAIMED);
      if (unminted.length > 0) {
        const accounts   = Array(unminted.length).fill(getAccount(account.address));
        const tokenIds   = unminted.map((nft) => nft.id);
        const ipfsHashes = unminted.map((nft) => (nft.metadataIpfsHash as string));
        const signatures = unminted.map((nft) => (nft.signature as string));
        console.log(`[mintAllGenesis] Minting ${unminted.length} NFTs`, accounts, tokenIds, ipfsHashes, signatures);
        genesisContract.batchMint(
          accounts,
          tokenIds,
          ipfsHashes,
          signatures
        );
      }
    }
  };

  // WORKS
  const mintAllWinter = () => {
    if (account?.address && winterNFTs) {
      const unminted = winterNFTs.filter((nft) => nft.claimed === ClaimStatus.UNCLAIMED);
      console.debug(`[mintAllWinter] trying to mint`, winterNFTs, unminted)
      if (unminted.length > 0) {
        const tokenIds   = unminted.map((nft) => nft.id);
        const signatures = unminted.map((nft) => (nft.signature2 as string));
        winterContract.batchMintAccount(
          account.address,
          tokenIds,
          signatures
        );
      }
    }
  };

  useEffect(() => {
    if (account?.address !== undefined) {
      // FIXME: move this to a datastore and fetch with an API
      // gets all BeaNFTs (claimed & unclaimed) from parsed-accounts.json
      loadNFTs(getAccount(account.address)).then((data) => {
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
          title="BeaNFTs"
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
              {tab === 0 && genesisNFTs && (
                <Button onClick={mintAllGenesis}>Mint All Genesis</Button>
              )}
              {tab === 1 && winterNFTs && (
                <Button onClick={mintAllWinter}>Mint All Winter</Button>
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
