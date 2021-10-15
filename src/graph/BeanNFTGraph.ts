import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { BEANSTALK_NFT_SUBGRAPH_API_LINK } from '../constants';

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
    )  {
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
{
  beanNfts(
    first: 1000
    orderBy: id,
    orderDirection: asc,
  ) {
    id
    account
    txn
  }
}
`;

export async function beanNFTQuery() {
  const data = await client.query({
    query: gql(NFTQuery),
  });
  let nfts = data.data.beanNfts.reduce((ns, s) => {
    const nft = {};
    nft.account = s.account;
    nft.id = parseInt(s.id);
    nft.txn = s.txn;
    ns.push(nft);
    return ns;
  }, []);
  nfts = nfts.sort((a, b) => a.id - b.id);
  return nfts;
}
