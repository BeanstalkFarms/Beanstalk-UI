import aboutIcon from 'img/nav-icons/about.svg';
import beanNFTIcon from 'img/nav-icons/bean-nft.svg';
import discordIcon from 'img/nav-icons/discord.svg';
import githubIcon from 'img/nav-icons/github.svg';
import governanceIcon from 'img/nav-icons/governance.svg';
import tradeIcon from 'img/nav-icons/trade.svg';
import twitterIcon from 'img/nav-icons/twitter.svg';

export type RouteData = {
  /** If set, link to this internal path. */
  path: string;
  /** Nav item title */
  title: string;
  /** Tag to show inside the nav item */
  tag?: string;
  /** If set, link out to this external URL. */
  href?: string;
  //
  icon?: string;
  disabled?: boolean;
  small?: boolean;
}

type RouteKeys = 'top' | 'analytics' | 'more' | 'additional'

const ROUTES : { [key in RouteKeys] : RouteData[] } = {
  // Main Navigation
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
      path: '/forecast',
      title: 'Forecast',
    },
  ],
  // Analytics Menu
  analytics: [
    {
      path: 'analytics/barnraise',
      title: 'Barn Raise Analytics',
    },
    {
      path: 'analytics/bean',
      title: 'Bean Analytics',
    },
    {
      path: 'analytics/silo',
      title: 'Silo Analytics',
    },
    {
      path: 'analytics/field',
      title: 'Field Analytics',
    }
  ],
  // More Menu
  more: [
    {
      path: 'market',
      title: 'Pod Market',
      icon: tradeIcon
    },
    {
      path: 'governance',
      href: 'https://snapshot.org/#/beanstalkdao.eth',
      title: 'Governance',
      icon: governanceIcon
    },
    {
      path: 'nft',
      title: 'BeaNFTs',
      small: true,
      icon: beanNFTIcon
    },
    {
      path: 'trade',
      title: 'Trade',
      disabled: true,
      small: true,
      icon: tradeIcon
    },
  ],
  // About Button
  additional: [
    {
      path: 'about',
      title: 'About',
      href: 'https://bean.money',
      icon: aboutIcon
    },
    {
      path: 'discord',
      href: 'https://discord.gg/beanstalk',
      title: 'Discord',
      icon: discordIcon
    },
    {
      path: 'twitter',
      href: 'https://twitter.com/beanstalkfarms',
      title: 'Twitter',
      icon: twitterIcon
    },
    {
      path: 'github',
      href: 'https://github.com/beanstalkfarms',
      title: 'Github',
      icon: githubIcon
    },
    {
      path: 'analytics',
      href: 'https://dune.xyz/tbiq/Beanstalk',
      title: 'Dune',
      icon: beanNFTIcon
    },
  ],
};

export default ROUTES;
