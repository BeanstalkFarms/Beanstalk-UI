export enum ClaimStatus {
  CLAIMED = 0,
  UNCLAIMED = 1,
}

export type Nft = {
  id: number;
  account: string;
  subcollection: string;
  imageIpfsHash?: string;
  /** 0 => claimed, 1 => unclaimed  */
  claimed?: ClaimStatus;

  // genesis only
  metadataIpfsHash?: string;
  signature?: string;

  // winter and genesis
  signature2?: string
}

export async function loadNFTs(account: string) {
  // FIXME: API load this
  // const nftData = (await import('../data/parsed-accounts.json')).default as { [key: string] : Nft[] };
  const nftData : Nft[] = await fetch(`/.netlify/functions/nfts?account=${account}`).then((response) => response.json());
  
  if (nftData.length === 0) {
    return {
      genesis: [],
      winter: [],
    };
  }

  const genesisNFTs = nftData.filter((n) => n.subcollection === 'Genesis');
  const winterNFTs  = nftData.filter((n) => n.subcollection === 'Winter');

  return {
    genesis: genesisNFTs,
    winter: winterNFTs,
  };
}
