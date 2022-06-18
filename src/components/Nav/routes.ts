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
  analytics: [
    {
      path: 'analytics/bean',
      title: 'Bean Analytics',
      disabled: false,
      href: null
    },
    {
      path: 'analytics/silo',
      title: 'Silo Analytics',
      disabled: false,
      href: null
    },
    {
      path: 'analytics/field',
      title: 'Field Analytics',
      disabled: false,
      href: null
    },
    {
      path: 'analytics/barnraise',
      title: 'Barnraise Analytics',
      disabled: false,
      href: null
    }
  ],
  more: [
    {
      path: 'trade',
      title: 'Silo',
      disabled: true,
    },
    {
      path: 'beanfts',
      title: 'BeaNFTs',
      disabled: true,
    },
    {
      path: 'governance',
      href: 'https://snapshot.org/#/beanstalkdao.eth',
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
