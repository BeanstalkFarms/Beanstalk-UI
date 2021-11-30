import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { BEAN_SUBGRAPH_API_LINK } from 'constants/index';

const LastCrossQuery = `
{
  beans(first: 1) {
    lastCross
  }
}`;

const client = new ApolloClient({
  uri: BEAN_SUBGRAPH_API_LINK,
  cache: new InMemoryCache(),
});

export async function lastCrossQuery() {
  try {
    const data = await client.query({
      query: gql(LastCrossQuery),
    });
    return data.data.beans[0].lastCross;
  } catch (error) {
    console.error('error fetching last cross.');
    return 0;
  }
}

const PriceQuery = `
{
  beans(first: 1) {
    price
  }
}`;

export async function priceQuery() {
  try {
    const data = await client.query({
      query: gql(PriceQuery),
    });
    return parseFloat(data.data.beans[0].price);
  } catch (error) {
    console.log('error fetching price.');
    return 0;
  }
}

const HourBeanQuery = `
query hourDatas($first: Int, $skip: Int) {
  hourDatas(
      skip: $skip
      first: $first,
      orderBy: hourTimestamp,
      orderDirection: desc,
    ) {
      id
      hourTimestamp
      totalSupply
      totalSupplyUSD
      totalCrosses
      price
    }
  }
`;

const DayBeanQuery = `
  {
    dayDatas(
      orderBy: dayTimestamp,
      orderDirection: desc,
      first: 1000
    ) {
      id
      dayTimestamp
      totalSupply
      totalSupplyUSD
      totalCrosses
      price
    }
  }
`;

function roundTo4Digits(num) {
  return parseFloat(num.toFixed(4));
}

function queryHourData(first: Number, skip: Number): Promise {
  return client.query({
    query: gql(HourBeanQuery),
    variables: { first: first, skip: skip },
  });
}

export async function hourBeanQuery() {
  try {
    const [d1, d2, d3] = await Promise.all([
      queryHourData(1000, 0),
      queryHourData(1000, 1000),
      queryHourData(1000, 2000),
    ]);
    const data = d1.data.hourDatas
      .concat(d2.data.hourDatas)
      .concat(d3.data.hourDatas);
    const dates = data.reduce((acc, d) => {
      const date = new Date();
      date.setTime(d.hourTimestamp * 1000);
      acc.push({
        x: date,
        totalSupply: roundTo4Digits(parseFloat(d.totalSupply)),
        totalSupplyUSD: roundTo4Digits(parseFloat(d.totalSupplyUSD)),
        price: roundTo4Digits(parseFloat(d.price)),
        totalCrosses: parseInt(d.totalCrosses, 10),
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

export async function dayBeanQuery() {
  try {
    const data = await client.query({
      query: gql(DayBeanQuery),
    });
    const dates = data.data.dayDatas.reduce((acc, d) => {
      const date = new Date();
      date.setTime(d.dayTimestamp * 1000);
      acc.push({
        x: date,
        totalSupply: roundTo4Digits(parseFloat(d.totalSupply)),
        totalSupplyUSD: roundTo4Digits(parseFloat(d.totalSupplyUSD)),
        price: roundTo4Digits(parseFloat(d.price)),
        totalCrosses: parseInt(d.totalCrosses, 10),
      });
      return acc;
    }, []);
    return dates.reverse();
  } catch (error) {
    console.error('error fetching day data.');
    return [];
  }
}
