import { BeanstalkPalette } from '~/components/App/muiTheme';

export const BEANSTALK_STATE_CONFIG: { [key: string]: [name: string, color: string, tooltip: string] } = {
  // Silo
  deposited:    ['Deposited', BeanstalkPalette.logoGreen, 'Assets that are Deposited in the Silo.'],
  withdrawn:    ['Withdrawn & Claimable', '#DFB385', 'Assets being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.'],
  claimable:    ['Claimable', '#ECBCB3', 'Assets that can be Claimed after a Withdrawal.'],
  // Farm
  farm:         ['Farm', '#F2E797', 'Assets stored in Beanstalk. Farm assets can be used in transactions on the Farm.'],
  circulating:  ['Circulating', BeanstalkPalette.lightBlue, 'Beanstalk assets in your wallet.'],
  pooled:       ['Pooled', BeanstalkPalette.grey, 'Total Beans across all pools.'],
  ripe:         ['Ripe', BeanstalkPalette.washedRed, 'Total underlying.'],
  budget:       ['Budget', BeanstalkPalette.brown, 'Total Beans in the BFM and BSM multi-sig wallets.'],
  farmPlusCirculating:        ['Farm & Circulating', BeanstalkPalette.darkBlue, 'Total farm and circulating Beans.']
};

export type BeanstalkStateID = keyof typeof BEANSTALK_STATE_CONFIG;
export const BEANSTALK_STATE_IDS = Object.keys(BEANSTALK_STATE_CONFIG) as BeanstalkStateID[];

export const FARMER_STATE_CONFIG: { [key: string]: [name: string, color: string, tooltip: string] } = {
  // Silo
  deposited:    ['Deposited', BeanstalkPalette.logoGreen, 'Assets that are Deposited in the Silo.'],
  withdrawn:    ['Withdrawn', '#DFB385', 'Assets being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.'],
  claimable:    ['Claimable', '#ECBCB3', 'Assets that can be Claimed after a Withdrawal.'],
  // Farm
  farm:         ['Farm', '#F2E797', 'Assets stored in Beanstalk. Farm assets can be used in transactions on the Farm.'],
  circulating:  ['Circulating', BeanstalkPalette.lightBlue, 'Beanstalk assets in your wallet.'],
};

export type FarmerStateID = keyof typeof FARMER_STATE_CONFIG;
export const FARMER_STATE_IDS = Object.keys(FARMER_STATE_CONFIG) as FarmerStateID[];
