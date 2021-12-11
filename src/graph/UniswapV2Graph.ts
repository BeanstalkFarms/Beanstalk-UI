import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { UNI_V2_SUBGRAPH_API_LINK } from 'constants/index';

// const APIURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

const client = new ApolloClient({
  uri: UNI_V2_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

const HourPoolQuery = `
  query pairHourDatas($first: Int, $skip: Int) {
    pairHourDatas(
      skip: $skip,
      first: $first,
      orderBy: hourStartUnix,
      orderDirection: desc,
      where: {
        pair: "0x87898263b6c5babe34b4ec53f22d98430b91e371"
      }
    ) {
      id
      hourStartUnix
      reserve1
      reserveUSD
      hourlyVolumeUSD
    }
  }
`;

const DayPoolQuery = `
  {
    tokenDayDatas(
      first: 1000
      orderBy: date,
      orderDirection: desc,
      where: {
        token: "0xdc59ac4fefa32293a95889dc396682858d52e5db"
      }
    ) {
      id
      date
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

function roundTo4Digits(num) {
  return parseFloat(num.toFixed(4));
}

function queryHourData(first: Number, skip: Number): Promise {
  return client.query({
    query: gql(HourPoolQuery),
    variables: { first: first, skip: skip },
  });
}

export async function hourUniswapQuery() {
  try {
    const [d1, d2, d3, d4] = await Promise.all([
      queryHourData(1000, 0),
      queryHourData(1000, 1000),
      queryHourData(1000, 2000),
      queryHourData(1000, 3000),
    ]);
    const data = d1.data.pairHourDatas
      .concat(d2.data.pairHourDatas)
      .concat(d3.data.pairHourDatas)
      .concat(d4.data.pairHourDatas);
    const dates = data.reduce((acc, d) => {
      const date = new Date();
      date.setTime(d.hourStartUnix * 1000);
      acc.push({
        x: date,
        liquidity: roundTo4Digits(parseFloat(d.reserveUSD)),
        volume: roundTo4Digits(parseFloat(d.hourlyVolumeUSD)),
      });
      return acc;
    }, []);
    dates.splice(dates.length - 1, 1);
    return dates.reverse();
  } catch (error) {
    console.error('error fetching hour data.');
    return [];
  }
}

export async function dayUniswapQuery() {
  try {
    const data = await client.query({
      query: gql(DayPoolQuery),
    });
    const dates = data.data.tokenDayDatas.reduce((acc, d) => {
      const date = new Date();
      date.setTime(d.date * 1000);
      // date = `${date.getMonth() + 1}/${date.getDate()}`
      acc.push({
        x: date,
        liquidity: roundTo4Digits(parseFloat(d.totalLiquidityUSD) * 2),
        volume: roundTo4Digits(parseFloat(d.dailyVolumeUSD)),
      });
      return acc;
    }, []);
    dates.pop();
    dates.pop();
    return dates.reverse();
  } catch (error) {
    console.error('error fetching day data.');
    return [];
  }
}
