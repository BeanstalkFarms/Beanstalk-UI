import { withStyles, Theme } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';

export { Grid } from '@material-ui/core';
export type { Token } from '../../util';
export {
  BudgetAsset,
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TransitAsset,
  UniswapAsset
} from '../../util';

export { default as AddressInputField } from './AddressInputField';
export { default as BalanceField } from './BalanceField';
export { default as ListInputField } from './ListInputField';
export { default as BaseModule } from './BaseModule';
export { default as ContentTitle } from './ContentTitle';
export { default as ContentSection } from './ContentSection';
export { default as DataBalanceModule } from './DataBalanceModule';
export { default as EthInputField } from './EthInputField';
export { default as FrontrunText } from './FrontrunText';
export { default as HeaderLabel } from './HeaderLabel';
export { default as HeaderLabelWithTimer } from './HeaderLabelWithTimer';
export { default as InputFieldPlus } from './InputFieldPlus';
export { default as ListTable } from './ListTable';
export { default as NftListTable } from './NftListTable';
export { default as NftPicTable } from './NftPicTable';
export { default as QuestionModule } from './QuestionModule';
export { default as SettingsFormModule } from './SettingsFormModule';
export { default as SingleButton } from './SingleButton';
export { default as SlippageModule } from './SlippageModule';
export { default as SwitchModule } from './SwitchModule';
export { default as TitleLabel } from './TitleLabel';
export { default as TokenBalanceModule } from './TokenBalanceModule';
export { default as TokenInputField } from './TokenInputField';
export { default as TokenOutputField } from './TokenOutputField';
export { default as TokenTypeImageModule } from './TokenTypeImageModule';
export { default as TransactionDetailsModule } from './TransactionDetailsModule';
export { default as UnitSelectionModule } from './UnitSelectionModule';
export { default as TabImageModule } from './TabImageModule';

export const FormatTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'black',
    boxShadow: theme.shadows[1],
    fontSize: 12,
    fontFamily: 'Futura-Pt-Book',
    width: (props) => props.width,
    maxWidth: '345px',
    margin: (props) => props.margin,
  },
}))(Tooltip);

FormatTooltip.defaultProps = {
  margin: '0 0 0 20px',
  width: 'auto',
};

export const walletDescriptions = {
  beanBalance:
    'Circulating Beans are in your wallet. Circulating Beans do not earn interest. You can Deposit Beans in the Silo or Sow Beans in the Field to start earning interest on your Beans.',
  lpBalance:
    'Circulating LP Tokens are in your wallet. Circulating LP Tokens do not earn interest. You can Deposit LP Tokens in the Silo to start earning interest on your Beans. To remove your liquidity from the BEAN:ETH pool, go to Uniswap.',
  beanSiloBalance:
    'These are your Beans which are Deposited in the Silo. This includes Beans you have been paid as interest on your Stalk holdings. For more information on your Deposited Beans, look in the Silo module.',
  lpSiloBalance:
    'These are your LP Tokens which are Deposited in the Silo. For more information on your Deposited LP Tokens, look in the Silo module.',
  beanTransitBalance:
    'These are your total Beans which are in Unclaimable Withdrawals. Withdrawals become Claimable 24 Full Seasons after Withdrawal. For more information on your Withdrawn Beans, look in the Silo module.',
  lpTransitBalance:
    'These are your total LP Tokens which are in Unclaimable Withdrawals. Withdrawals become Claimable 24 Full Seasons after Withdrawal. For more information on your Withdrawn LP Tokens, look in the Silo module.',
  claimableBeanBalance:
    'These are your total Claimable Beans which are from Pod Harvests and Withdrawals. For more information on your Claimable Bean Withdrawals, look in the Silo module. For more information on your Harvestable Pods, look in the Field module.',
  claimablelpBalance:
    'These are your total Claimable LP Tokens which are from Withdrawals. For more information on your Claimable LP Token Withdrawals, look in the Silo module.',
  claimableEthBalance:
    'These are your total Claimable ETH which are from Seasons of Plenty.',
  stalkBalance:
    'This is your total Stalk Balance. Stalk are the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo.',
  seedBalance:
    'This is your total Seed Balance. Each Seed yields .0001 Grown Stalk each Season. Grown Stalk must be Farmed in order to be included in your Stalk balance and start earning interest.',
  podBalance:
    'This is your total Unharvestable Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line, look in the Field module.',
  ethBalance: 'This is the ETH balance of your wallet.',
  topLeft:
    'The Bean Balance is the total USD value of your Beans and LP Tokens. This total does not include your Pods or claimable ETH.',
  topLeftTitle: 'Bean Balance',
  topRight:
    'Your current ownership of Beanstalk is displayed as a percent. Ownership is determined by your proportional ownership of Stalk.',
  topRightTitle: 'Ownership',
};
export const totalDescriptions = {
  beanBalance: 'This is the number of Beans not in the Silo or Withdrawals.',
  budgetBalance: 'This is the number of Beans in the Marketing and Development Budgets.',
  lpBalance: 'This is the number of LP Tokens not in the Silo or Withdrawals.',
  beanSiloBalance:
    'This is the number of Beans currently Deposited in the Silo.',
  lpSiloBalance: 'This is the number of LP Tokens Deposited in the Silo.',
  beanTransitBalance:
    'This is the number of Beans in Unclaimed Withdrawals. This includes both frozen and Claimable Bean Withdrawals.',
  lpTransitBalance:
    'This is the number of LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable LP Token Withdrawals.',
  stalkBalance:
    'This is the total current number of Stalk. Stalk are the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Stalk is forfeited upon Withdrawal of Deposited assets from the Silo.',
  seedBalance:
    'This is the total current number of Seeds. Each Seed yields .0001 Stalk each Season.',
  podBalance:
    'This is the total number of Unharvestable Pods. This is the outstanding debt of Beanstalk.',
  ethBalance: 'This is the number of Ethereum in the BEAN:ETH liquidity pool.',
  beanReserveTotal:
    'This is the number of Beans in the BEAN:ETH liquidity pool.',
  topLeft: 'This is the current USD value of all Beans.',
  topLeftTitle: 'Market Cap',
  topRight: 'This is the current USD value of the BEAN:ETH liquidity pool.',
  topRightTitle: 'Pool Value',
};
export const walletStrings = {
  topLeft: 'Beans',
  topRight: 'Ownership',
};
export const totalStrings = {
  topLeft: 'USD',
  topRight: 'USD',
};
