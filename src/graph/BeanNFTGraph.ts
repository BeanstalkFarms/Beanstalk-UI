import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { WINTER_NFT_SUBGRAPH_API_LINK } from 'constants/index';

// const APIURL = 'https://api.studio.thegraph.com/query/6727/bean-nft/v1.0.0'

const client = new ApolloClient({
  uri: WINTER_NFT_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

const StateQuery = `
{
  states(first: 1) {
    id
    season
    nfts
    mintedNFTs
  }
}
`;

const WinterNFTQuery = `
query winterNFTs($season: String) {
  investments(
    orderBy: beans,
    orderDirection: desc,
    first: 5,
    where: {
      season: $season
    }
  ) {
    id
    beans
    hasBeaNFT
    txn
    type
    timeSinceSunrise
    user {
      id
    }
    season {
      id
    }
  }
  users(
    orderBy: investedBeans,
    orderDirection: desc,
    first: 1000,
    where: {
      investedBeans_gt: 0
    }
  ) {
    id
    earnedNFTs
    investedBeans
  }
}
`;

export async function queryWinterNFTs(): Promise {
  let data = await client.query({
    query: gql(StateQuery),
  });

  const season = data.data.states[0].season;
  const totalNFTs = data.data.states[0].nfts;

  data = await client.query({
    query: gql(WinterNFTQuery),
    variables: { season: season },
  });

  const investments = data.data.investments.map((i) => {
    const investment = {};
    investment.account = i.user.id;
    investment.beans = i.beans;
    investment.type = i.type;
    investment.txn = i.txn;
    return investment;
  });

  const accounts = data.data.users.map((a) => {
    const account = {};
    account.account = a.id;
    account.investedBeans = a.investedBeans;
    account.nfts = a.earnedNFTs;
    return account;
  });

  return {
    investmentNFTs: investments,
    accountNFTs: accounts,
    totalNFTs: totalNFTs,
  };
}

const AccountQuery = `
query accounts($account: String) {
  users(
    first: 1
    where: {
      id: $account
    }
  ) {
    genesisNFTs
    winterNFTs
    mintedNFTs
    unmintedNFTs
    earnedNFTs
    investedBeans
  }
}

`;

export async function queryAccountNFTStats(account) {
  const data = await client.query({
    query: gql(AccountQuery),
    variables: { account: account },
  });

  const user = data.data.users[0];
  if (!user) {
      return {};
  }
  return user;
}

type Nft = {
  id: number;
  metadataIpfsHash?: string;
  imageIpfsHash?: string;
  signature?: string;
  account: string;
  subcollection: string;
}

export async function loadNFTs(account: string) {
  const nftData = (await import('../json/accounts2.json')).default as { [key: string] : Nft[] };
  if (!nftData[account]) {
    return {
      genesis: [],
      winter: [],
    };
  }
  const genesisNFTs = nftData[account].filter((n) => n.subcollection === 'Genesis');
  const winterNFTs = nftData[account].filter((n) => n.subcollection === 'Winter');
  return {
    genesis: genesisNFTs,
    winter: winterNFTs,
  };
}

// const SowQuery = `
// query sows($season: String) {
//   sows(
//     where: {
//       season: $season
//     }
//     orderBy: beans,
//     orderDirection: desc,
//     first: 10
//   ) {
//     id
//     beans
//     season {
//       id
//     }
//     user {
//       id
//     }
//     txn
//     timeSinceSunrise
//   }
// }
// `;

// const client = new ApolloClient({
//   uri: BEANSTALK_NFT_SUBGRAPH_API_LINK,
//   cache: new InMemoryCache(),
// });

// export async function beanNFTSowQuery(season) {
//   const data = await client.query({
//     query: gql(SowQuery),
//     variables: { season: season },
//   });
//   const sows = data.data.sows.reduce((ss, s) => {
//     const sow = {};
//     sow.account = s.user.id;
//     sow.beans = s.beans;
//     sow.timeSinceSunrise = s.timeSinceSunrise;
//     ss.push(sow);
//     return ss;
//   }, []);
//   return sows;
// }

// const NFTQuery = `
// query beanNfts($first: Int, $skip: Int) {
//   beanNfts(
//     skip: $skip
//     first: $first
//     orderBy: id,
//     orderDirection: asc,
//   ) {
//     id
//     account
//     txn
//   }
// }
// `;

// function queryNfts(first: Number, skip: Number): Promise {
//   return client.query({
//     query: gql(NFTQuery),
//     variables: { first: first, skip: skip },
//   });
// }

// export async function beanNFTQuery() {
//   const [d1, d2] = await Promise.all([
//     queryNfts(1000, 0),
//     queryNfts(1000, 1000),
//     queryNfts(1000, 2000),
//   ]);
//   const data = d1.data.beanNfts.concat(d2.data.beanNfts);
//   let nfts = data.reduce((ns, s) => {
//     const nft = {};
//     nft.account = s.account;
//     nft.id = parseInt(s.id, 10);
//     nft.txn = s.txn;
//     ns.push(nft);
//     return ns;
//   }, []);
//   nfts = nfts.sort((a, b) => a.id - b.id);
//   return nfts;
// }
