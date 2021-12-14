import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { BEANSTALK_SUBGRAPH_API_LINK } from 'constants/index';

const client = new ApolloClient({
  uri: BEANSTALK_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

const APYQuery = `
{
    seasons(
       orderBy: timestamp,
       orderDirection: desc,
       where: {
           timestamp_gt: 0
       },
       first: 1
 ) {
       id
       farmableBeansPerSeason7
       farmableBeansPerSeason30
       harvestableBeansPerSeason7
       harvestableBeansPerSeason30
  }
 }
 `;

const SeasonQuery = `
query seasons($first: Int, $skip: Int) {
    seasons(
       skip: $skip
       first: $first,
       orderBy: timestamp,
       orderDirection: asc
       where: {
           timestamp_gt: 0
       }
 ) { 
       id
       timestamp
       podIndex
       price
       weather
       newPods
       pods
       harvestableBeans
       depositedBeans
       withdrawnBeans
       beans
       lp
       depositedLP
       withdrawnLP
       stalk
       seeds
       harvestedPods
       numberOfSowers
       numberOfSows
       sownBeans
  } 
 }
 `;

function roundTo4Digits(num) {
  return parseFloat(num.toFixed(4));
}

function querySeasons(first: Number, skip: Number): Promise {
  return client.query({
    query: gql(SeasonQuery),
    variables: { first: first, skip: skip },
  });
}

export async function beanstalkQuery() {
  try {
    const [d1, d2, d3, d4] = await Promise.all([
      querySeasons(1000, 0),
      querySeasons(1000, 1000),
      querySeasons(1000, 2000),
      querySeasons(1000, 3000),
    ]);
    const data = d1.data.seasons
      .concat(d2.data.seasons)
      .concat(d3.data.seasons)
      .concat(d4.data.seasons);
    const seasons = data.map((s) => {
      const season = {};
      Object.keys(s).forEach((key) => {
        season[key] = roundTo4Digits(parseFloat(s[key]));
      });
      season.id = parseInt(s.id, 10);
      const date = new Date();
      date.setTime(s.timestamp * 1000);
      season.x = date;
      return season;
    }, []);
    return seasons;
  } catch (error) {
    console.error('error fetching Beanstalk data.');
    return [];
  }
}

export async function apyQuery() {
  try {
    const apyData = await client.query({
      query: gql(APYQuery),
    });
    const bps = apyData.data.seasons[0];
    return {
      farmableWeek: parseFloat(bps.farmableBeansPerSeason7),
      farmableMonth: parseFloat(bps.farmableBeansPerSeason30),
      harvestableWeek: parseFloat(bps.harvestableBeansPerSeason7),
      harvestableMonth: parseFloat(bps.harvestableBeansPerSeason30),
    };
  } catch (error) {
    console.error('error fetching Beanstalk data.');
    return {};
  }
}
