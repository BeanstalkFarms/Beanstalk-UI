import { gql } from "@apollo/client";
// import BigNumber from "bignumber.js";

export const SEASONS_QUERY_1 = gql`query SeasonsQuery(
  $first: Int,
  $skip: Int,
)  {
  seasons(
    first: $first,
    skip: $skip,
    orderBy: seasonInt,
    orderDirection: desc,
  ) {
    id
    seasonInt
    twap
    timestamp
    field {
      weather
      podRate
    }
  }
}`

export const SEASONS_QUERY = gql`query SeasonsQuery(
  $season_lte: Int,
  $first: Int,
)  {
  seasons(
    where: {
      seasonInt_lte: $season_lte
    }
    first: $first,
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

// function querySeasons(first: Number, skip: Number): Promise<any> {
//   return apolloClient
//     .query({
//       query: SEASONS_QUERY,
//       variables: { first: first, skip: skip },
//     })
//     .then((result) => result.data.seasons)
//     .then((seasons) => seasons.map((season: any) => ({
//       seasonInt: season.seasonInt,
//       field: {
//         weather: season.field.weather,
//         podRate: new BigNumber(season.field.podRate),
//       }
//     })));
// }
