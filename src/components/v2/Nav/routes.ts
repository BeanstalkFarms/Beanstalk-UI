const ROUTES = {
  top: [
    {
      path: '/',
      title: 'Barn Raise',
      tag: 'NEW'
    },
    {
      path: '/silo',
      title: 'Silo',
    },
    {
      path: '/field',
      title: 'Field',
    },
    {
      path: '/balances',
      title: 'Balances',
    },
    {
      path: '/forecast',
      title: 'Forecast',
    },
  ],
  more: [
    {
      path: 'trade',
      title: 'Trade',
      disabled: true,
    },
    {
      path: 'beanfts',
      title: 'BeaNFTs',
      disabled: true,
    },
    {
      path: 'governance',
      href: 'https://snapshot.org/#/beanstalkfarms.eth',
      title: 'Governance',
    },
    {
      path: 'analytics',
      href: 'https://dune.xyz/tbiq/Beanstalk',
      title: 'Analytics',
    },
    {
      path: 'discord',
      href: 'https://discord.gg/beanstalk',
      title: 'Discord',
    },
    {
      path: 'about',
      title: 'About',
      href: 'https://bean.money',
    },
  ],
};

export default ROUTES;
