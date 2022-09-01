export enum SGEnvironments {
  THEGRAPH_PROD = 'thegraph-prod',
  THEGRAPH_DEV = 'thegraph-dev',
  THEGRAPH_TEST = 'thegraph-test',
  BF_PROD = 'bf-prod',
  BF_DEV = 'bf-dev',
  BF_TEST = 'bf-test',
}

type SGEnvironment = {
  name: string;
  url: string;
}

export const BEANSTALK_SUBGRAPH_ENDPOINTS : Record<SGEnvironments, SGEnvironment> = {
  [SGEnvironments.BF_PROD]:       {
    name: 'Beanstalk Farms / Production',
    url: 'https://graph.node.bean.money/subgraphs/name/beanstalk',
  },
  [SGEnvironments.BF_DEV]:        {
    name: 'Beanstalk Farms / Development',
    url: 'https://graph.node.bean.money/subgraphs/name/beanstalk-dev',
  },
  [SGEnvironments.BF_TEST]:       {
    name: 'Beanstalk Farms / Test',
    url: 'https://graph.node.bean.money/subgraphs/name/beanstalk-testing',
  },
  [SGEnvironments.THEGRAPH_PROD]: {
    name: 'The Graph / Production',
    url: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk',
  },
  [SGEnvironments.THEGRAPH_DEV]:  {
    name: 'The Graph / Development',
    url: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev'
  },
  [SGEnvironments.THEGRAPH_TEST]: {
    name: 'The Graph / Test',
    url: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-testing',
  },
};
