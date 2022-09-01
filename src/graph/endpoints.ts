export enum SGEnvironments {
  BF_PROD = 'bf-prod',
  BF_DEV = 'bf-dev',
  BF_TEST = 'bf-test',
  THEGRAPH_PROD = 'thegraph-prod',
  THEGRAPH_DEV = 'thegraph-dev',
  THEGRAPH_TEST = 'thegraph-test',
}

type SGEnvironment = {
  name: string;
  subgraphs: {
    beanstalk: string;
    bean: string;
  }
}

export const SUBGRAPH_ENVIRONMENTS : Record<SGEnvironments, SGEnvironment> = {
  [SGEnvironments.BF_PROD]:       {
    name: 'Beanstalk Farms / Production',
    subgraphs: {
      beanstalk: 'https://graph.node.bean.money/subgraphs/name/beanstalk',
      bean: 'https://graph.node.bean.money/subgraphs/name/bean'
    },
  },
  [SGEnvironments.BF_DEV]:        {
    name: 'Beanstalk Farms / Development',
    subgraphs: {
      beanstalk: 'https://graph.node.bean.money/subgraphs/name/beanstalk-dev',
      bean: 'https://graph.node.bean.money/subgraphs/name/bean-dev'
    }
  },
  [SGEnvironments.BF_TEST]:       {
    name: 'Beanstalk Farms / Test',
    subgraphs: {
      beanstalk: 'https://graph.node.bean.money/subgraphs/name/beanstalk-testing',
      bean: 'https://graph.node.bean.money/subgraphs/name/bean-testing'
    }
  },
  [SGEnvironments.THEGRAPH_PROD]: {
    name: 'The Graph / Production',
    subgraphs: {
      beanstalk: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk',
      bean: 'https://api.thegraph.com/subgraphs/name/cujowolf/bean'
    }
  },
  [SGEnvironments.THEGRAPH_DEV]:  {
    name: 'The Graph / Development',
    subgraphs: {
      beanstalk: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev',
      bean: 'https://api.thegraph.com/subgraphs/name/cujowolf/bean'
    }
  },
  [SGEnvironments.THEGRAPH_TEST]: {
    name: 'The Graph / Test',
    subgraphs: {
      beanstalk: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-testing',
      bean: 'https://api.thegraph.com/subgraphs/name/cujowolf/bean'
    }
  },
};
