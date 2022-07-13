import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Container, Divider, Stack, Tab, Tabs, Typography, } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useAccount, useSigner } from 'wagmi';
import fetch from 'node-fetch';
import { getAccount } from 'util/Account';
import { ClaimStatus, loadNFTs, Nft } from 'util/BeaNFTs';
import NFTDialog from '../components/NFT/NFTDialog';
import WalletCard from '../components/NFT/WalletCard';
import { BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES } from '../constants';
import NFTGrid from '../components/NFT/NFTGrid';
import { useGenesisNFTContract, useWinterNFTContract } from '../hooks/useContract';
import TransactionToast from '../components/Common/TxnToast';

const NFTPage: React.FC = () => {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const genesisContract = useGenesisNFTContract(signer);
  const winterContract = useWinterNFTContract(signer);

  // component state
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // NFT state
  const [selectedNFT, setSelectedNFT] = useState<Nft | null>(null);
  const [genesisNFTs, setGenesisNFTs] = useState<Nft[] | null>(null);
  const [winterNFTs, setWinterNFTs]   = useState<Nft[] | null>(null);
  const unmintedGenesis = genesisNFTs?.filter((nft) => nft.claimed === ClaimStatus.UNCLAIMED);
  const unmintedWinter = winterNFTs?.filter((nft) => nft.claimed === ClaimStatus.UNCLAIMED);

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
        console.debug('[parseMints] response: ', response);
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

  // Mint Single Genesis BeaNFT
  const mintGenesis = () => {
    if (selectedNFT?.claimed === ClaimStatus.UNCLAIMED && account?.address) {
      const txToast = new TransactionToast({
        loading: `Minting Genesis BeaNFT ${selectedNFT.id}`,
        success: 'Mint complete!',
      });
      
      genesisContract.mint(getAccount(account.address), selectedNFT.id, selectedNFT.metadataIpfsHash as string, selectedNFT.signature as string)
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
        })
        .catch((err) => {
          console.error(
            txToast.error(err.error || err)
          );
        });
    }
  };

  // Mint All Genesis BeaNFTs
  const mintAllGenesis = () => {
    if (unmintedGenesis && genesisNFTs && account?.address && unmintedGenesis?.length > 0) {
      const txToast = new TransactionToast({
        loading: 'Minting all Genesis BeaNFTs',
        success: 'Mint complete!',
      });
      
      const accounts   = Array(unmintedGenesis.length).fill(getAccount(account.address));
      const tokenIds   = unmintedGenesis.map((nft) => nft.id);
      const ipfsHashes = unmintedGenesis.map((nft) => (nft.metadataIpfsHash as string));
      const signatures = unmintedGenesis.map((nft) => (nft.signature as string));
      genesisContract.batchMint(accounts, tokenIds, ipfsHashes, signatures)
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
        })
        .catch((err) => {
          console.error(
            txToast.error(err.error || err)
          );
        });
    }
  };
  
  // Mint Single Winter BeaNFT
  const mintWinter = () => {
    if (selectedNFT?.claimed === ClaimStatus.UNCLAIMED && account?.address) {
      const txToast = new TransactionToast({
        loading: `Minting Winter BeaNFT ${selectedNFT.id}`,
        success: 'Mint complete!',
      });
      
      winterContract.mint(getAccount(account.address), selectedNFT.id, selectedNFT.signature2 as string)
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
        })
        .catch((err) => {
          console.error(
            txToast.error(err.error || err)
          );
        });
    }
  };

  // Mint All Winter BeaNFTs
  const mintAllWinter = () => {
    if (unmintedWinter && winterNFTs && account?.address && (unmintedWinter.length > 0)) {
      const txToast = new TransactionToast({
        loading: 'Minting all Winter BeaNFTs',
        success: 'Mint complete!',
      });
      
      const tokenIds   = unmintedWinter.map((nft) => nft.id);
      const signatures = unmintedWinter.map((nft) => (nft.signature2 as string));
      winterContract.batchMintAccount(getAccount(account.address), tokenIds, signatures)
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
        })
        .catch((err) => {
          console.error(
            txToast.error(err.error || err)
          );
        });
    }
  };

  // maps a NFT collection to a mint function
  const contractMap: {[s: string]: any} = {
    Genesis: mintGenesis,
    Winter: mintWinter,
  };

  useEffect(() => {
    if (account?.address !== undefined) {
      loadNFTs(getAccount(account.address)).then((data) => {
        const genNFTs = data.genesis;
        const winNFTs = data.winter;

        parseMints(genNFTs, BEANFT_GENESIS_ADDRESSES[1], setGenesisNFTs);
        parseMints(winNFTs, BEANFT_WINTER_ADDRESSES[1], setWinterNFTs);
      });
    }
  }, [account?.address, parseMints]);

  // TODO: direct user to connect a wallet
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
                <Button disabled={!unmintedGenesis || unmintedGenesis.length === 0} onClick={mintAllGenesis}>Mint All Genesis</Button>
              )}
              {tab === 1 && winterNFTs && (
                <Button disabled={!unmintedWinter || unmintedWinter.length === 0} onClick={mintAllWinter}>Mint All Winter</Button>
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
        address={account.address}
        handleMint={contractMap[selectedNFT.subcollection]}
      />}
      
    </Container>
  );
};

export default NFTPage;
