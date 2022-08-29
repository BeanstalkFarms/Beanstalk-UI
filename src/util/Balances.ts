import { BeanstalkPalette } from '~/components/App/muiTheme';

export const STATE_CONFIG: { [key: string]: [name: string, color: string, tooltip: string] } = {
  // Silo
  deposited:    ['Deposited', BeanstalkPalette.logoGreen, 'Assets that are Deposited in the Silo.'],
  withdrawn:    ['Withdrawn', '#DFB385', 'Assets being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.'],
  claimable:    ['Claimable', '#ECBCB3', 'Assets that can be Claimed after a Withdrawal.'],
  // Farm
  farm:         ['Farm', '#F2E797', 'Assets stored in Beanstalk. Farm assets can be used in transactions on the Farm.'],
  circulating:  ['Circulating', BeanstalkPalette.lightBlue, 'Beanstalk assets in your wallet.'],
  pooled:       ['Pooled', BeanstalkPalette.grey, 'Total Beans across all pools.'],
  ripe:         ['Ripe', BeanstalkPalette.washedRed, 'Total underlying.'],
  budget:       ['Budget', BeanstalkPalette.brown, 'Total Beans in the BFM and BSM multi-sig wallets.']
};

export type StateID = keyof typeof STATE_CONFIG;
export const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];
