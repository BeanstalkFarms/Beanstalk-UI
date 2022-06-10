import flatMap from 'lodash/flatMap';
import sumBy from 'lodash/sumBy';
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

const FarmableMonthTotalQuery = `
  query {
    seasons(
      first: 720,
      orderBy: timestamp,
      orderDirection: desc,
    ) {
      newFarmableBeans
    }
  }
`;

function roundTo4Digits(num: number) {
  return parseFloat(num.toFixed(4));
}

function querySeasons(first: Number, skip: Number): Promise<any> {
  return client.query({
    query: gql(SeasonQuery),
    variables: { first: first, skip: skip },
  });
}

export async function beanstalkQuery() {
  try {
    // FIXME: Need a more efficient and scalable query
    const results = await Promise.all([
      querySeasons(1000, 0),
      querySeasons(1000, 1000),
      querySeasons(1000, 2000),
      querySeasons(1000, 3000),
      querySeasons(1000, 4000),
      querySeasons(1000, 5000),
      querySeasons(1000, 6000),
    ]);
    const data = flatMap(results, (d: any) => d.data.seasons);

    const seasons = data.map((s) => {
      const season : any = {};
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

export async function farmableMonthTotalQuery() {
  try {
    const response = await client.query({
      query: gql(FarmableMonthTotalQuery),
    });

    const total = sumBy(
      response.data.seasons,
      (season: any) => parseInt(season.newFarmableBeans, 10),
    );

    return total;
  } catch (error) {
    console.error('error fetching Beanstalk data.', error);
    return 0;
  }
}
