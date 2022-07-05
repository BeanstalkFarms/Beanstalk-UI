import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import BigNumber from "bignumber.js";

const client = new ApolloClient({
  uri: `https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev`,
  cache: new InMemoryCache(),
});

export const SEASONS_QUERY = gql`query SeasonsQuery(
  $first: Int,
  $last: Int,
  $skip: Int,
)  {
  seasons(
    first: $first,
    last: $last,
    skip: $skip,
    orderBy: seasonInt,
    orderDirection: desc,
  ) {
    seasonInt
    twap
    timestamp
    field {
      weather
      podRate
    }
  }
}`

function querySeasons(first: Number, skip: Number): Promise<any> {
  return client
    .query({
      query: SEASONS_QUERY,
      variables: { first: first, skip: skip },
    })
    .then((result) => result.data.seasons)
    .then((seasons) => seasons.map((season: any) => ({
      seasonInt: season.seasonInt,
      field: {
        weather: season.field.weather,
        podRate: new BigNumber(season.field.podRate),
      }
    })));
}
