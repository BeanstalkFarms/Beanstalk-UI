import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { BEANSTALK_UNI_SUBGRAPH_API_LINK } from '../constants'

// const APIURL = 'https://api.studio.thegraph.com/query/6727/beanstalk-uniswap/v0.0.9'

const LastCrossQuery =`
{
  beans(first: 1) {
    lastCross
  }
}`

const client = new ApolloClient({
  uri: BEANSTALK_UNI_SUBGRAPH_API_LINK,
  cache: new InMemoryCache()
});

export async function lastCrossQuery() {
  const data = await client.query({
    query: gql(LastCrossQuery)
  })
  return data.data.beans[0].lastCross
}

const HourBeanQuery = `
  {
    hourDatas(
      orderBy: hourTimestamp,
      orderDirection: desc,
      first: 1000
    ) {
      id
      hourTimestamp
      totalSupply
      totalSupplyUSD
      price
    }
  }
`

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
      price
    }
  }
`

function roundTo4Digits(num) {
  return parseFloat(num.toFixed(4))
}

export async function hourBeanQuery() {
  const data = await client.query({
    query: gql(HourBeanQuery)
  })
  const dates = data.data.hourDatas.reduce((acc, d) => {
    var date = new Date()
    date.setTime(d.hourTimestamp * 1000)
    acc.push({
      x: date,
      totalSupply: roundTo4Digits(parseFloat(d.totalSupply)),
      totalSupplyUSD: roundTo4Digits(parseFloat(d.totalSupplyUSD)),
      price: roundTo4Digits(parseFloat(d.price)),
    })
    return acc
  }, [])
  dates.splice(dates.length - 16, 16)
  return dates.reverse()
}

export async function dayBeanQuery() {
  const data = await client.query({
    query: gql(DayBeanQuery)
  })
  const dates = data.data.dayDatas.reduce((acc, d) => {
    var date = new Date()
    date.setTime(d.dayTimestamp * 1000)
    acc.push({
      x: date,
      totalSupply: roundTo4Digits(parseFloat(d.totalSupply)),
      totalSupplyUSD: roundTo4Digits(parseFloat(d.totalSupplyUSD)),
      price: roundTo4Digits(parseFloat(d.price)),
    })
    return acc
  }, [])
  dates.pop()
  dates.pop()
  return dates.reverse()
}
