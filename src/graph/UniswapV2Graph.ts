import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { UNI_V2_SUBGRAPH_API_LINK } from 'constants/index';

// const APIURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

const DayPoolQuery = `
  {
    tokenDayDatas(
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

const HourPoolQuery = `
  {
    pairHourDatas(
      orderBy: hourStartUnix,
      orderDirection: desc,
      first: 1000,
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

const client = new ApolloClient({
  uri: UNI_V2_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

function roundTo4Digits(num) {
  return parseFloat(num.toFixed(4));
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
  } catch {
    return [];
  }
}

export async function hourUniswapQuery() {
  const data = await client.query({
    query: gql(HourPoolQuery),
  });
  const dates = data.data.pairHourDatas.reduce((acc, d) => {
    const date = new Date();
    date.setTime(d.hourStartUnix * 1000);
    acc.push({
      x: date,
      liquidity: roundTo4Digits(parseFloat(d.reserveUSD)),
      volume: roundTo4Digits(parseFloat(d.hourlyVolumeUSD)),
    });
    return acc;
  }, []);
  dates.splice(dates.length - 7, 7);
  return dates.reverse();
}
