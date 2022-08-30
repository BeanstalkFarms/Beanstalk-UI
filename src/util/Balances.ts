import { BeanstalkPalette } from '~/components/App/muiTheme';

export const STATE_CONFIG: { [key: string]: [name: string, color: string, tooltip: string] } = {
  // Silo
  deposited:    ['Deposited', BeanstalkPalette.logoGreen, 'Assets that are Deposited in the Silo.'],
  withdrawn:    ['Withdrawn & Claimable', '#DFB385', 'Assets being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.'],
  claimable:    ['Claimable', '#ECBCB3', 'Assets that can be Claimed after a Withdrawal.'],
  // Farm
  farm:         ['Farm', '#F2E797', 'Assets stored in Beanstalk. Farm assets can be used in transactions on the Farm.'],
  circulating:  ['Circulating', BeanstalkPalette.lightBlue, 'Beanstalk assets in your wallet.'],
  pooled:       ['Pooled', BeanstalkPalette.grey, 'Beans in all liquidity pools.'],
  ripe:         ['Ripe', BeanstalkPalette.washedRed, 'Assets minted as Fertilizer is sold. Ripe assets are the assets underlying Unripe assets.'],
  budget:       ['Budget', BeanstalkPalette.brown, 'Beans in the BFM and BSM wallets.'],
  farmPlusCirculating:        ['Farm & Circulating', BeanstalkPalette.darkBlue, 'Farm assets are stored in Beanstalk. Circulating assets are in Farmers\' wallets.']
};

export type StateID = keyof typeof STATE_CONFIG;
export const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];
