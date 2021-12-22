import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { BEANSTALK_NFT_SUBGRAPH_API_LINK } from 'constants/index';
import * as nftData from 'json/accounts.json';
// const APIURL = 'https://api.studio.thegraph.com/query/6727/bean-nft/v1.0.0'

const SowQuery = `
query sows($season: String) {
  sows(
    where: {
      season: $season
    }
    orderBy: beans,
    orderDirection: desc,
    first: 10
  ) {
    id
    beans
    season {
      id
    }
    user {
      id
    }
    txn
    timeSinceSunrise
  }
}
`;

const client = new ApolloClient({
  uri: BEANSTALK_NFT_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

export async function beanNFTSowQuery(season) {
  const data = await client.query({
    query: gql(SowQuery),
    variables: { season: season },
  });
  const sows = data.data.sows.reduce((ss, s) => {
    const sow = {};
    sow.account = s.user.id;
    sow.beans = s.beans;
    sow.timeSinceSunrise = s.timeSinceSunrise;
    ss.push(sow);
    return ss;
  }, []);
  return sows;
}

const NFTQuery = `
query beanNfts($first: Int, $skip: Int) {
  beanNfts(
    skip: $skip
    first: $first
    orderBy: id,
    orderDirection: asc,
  ) {
    id
    account
    txn
  }
}
`;

function queryNfts(first: Number, skip: Number): Promise {
  return client.query({
    query: gql(NFTQuery),
    variables: { first: first, skip: skip },
  });
}

export async function beanNFTQuery() {
  const [d1, d2] = await Promise.all([
    queryNfts(1000, 0),
    queryNfts(1000, 1000),
    queryNfts(1000, 2000),
  ]);
  const data = d1.data.beanNfts.concat(d2.data.beanNfts);
  let nfts = data.reduce((ns, s) => {
    const nft = {};
    nft.account = s.account;
    nft.id = parseInt(s.id, 10);
    nft.txn = s.txn;
    ns.push(nft);
    return ns;
  }, []);
  nfts = nfts.sort((a, b) => a.id - b.id);
  return nfts;
}

export async function loadNFTs(account) {
  if (!nftData.default[account]) return [];
  const nfts = nftData.default[account];
  nfts.map((n) => {
    n.id = parseInt(n.id, 10);
    return n;
  });
  return nfts;
}
