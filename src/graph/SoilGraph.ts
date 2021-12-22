import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { SOIL_SUBGRAPH_API_LINK } from 'constants/index';

const SoilQuery = `
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
       soil
  } 
 }
 `;

 function roundTo4Digits(num) {
    return parseFloat(num.toFixed(4));
  }

 const client = new ApolloClient({
  uri: SOIL_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

 function querySoil(first: Number, skip: Number): Promise {
  return client.query({
    query: gql(SoilQuery),
    variables: { first: first, skip: skip },
  });
}

 export async function soilQuery() {
  try {
    const [d1, d2, d3, d4] = await Promise.all([
      querySoil(1000, 0),
      querySoil(1000, 1000),
      querySoil(1000, 2000),
      querySoil(1000, 3000),
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
