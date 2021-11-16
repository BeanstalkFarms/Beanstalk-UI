import { Theme, withStyles } from '@material-ui/styles';
import { Tooltip } from '@material-ui/core';

export { Grid } from '@material-ui/core';
export type { Token } from 'util/index';
export {
  BudgetAsset,
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TransitAsset,
  UniswapAsset,
} from 'util/index';

export { default as AddressInputField } from './AddressInputField';
export { default as BalanceField } from './BalanceField';
export { default as ListInputField } from './ListInputField';
export { default as BaseModule } from './BaseModule';
export { default as ContentTitle } from './ContentTitle';
export { default as ContentSection } from './ContentSection';
export { default as ClaimTextModule } from './ClaimTextModule';
export { default as DataBalanceModule } from './DataBalanceModule';
export { default as EthInputField } from './EthInputField';
export { default as FrontrunText } from './FrontrunText';
export { default as HeaderLabel } from './HeaderLabel';
export { default as HeaderLabelWithTimer } from './HeaderLabelWithTimer';
export { default as InputFieldPlus } from './InputFieldPlus';
export { default as ListTable } from './ListTable';
export { default as NftListTable } from './NftListTable';
export { default as NftPicTable } from './NftPicTable';
export { default as PlotInputField } from './PlotInputField';
export { default as QuestionModule } from './QuestionModule';
export { default as SettingsFormModule } from './SettingsFormModule';
export { default as SingleButton } from './SingleButton';
export { default as SlippageModule } from './SlippageModule';
export { default as SwapTransactionDetailsModule } from './SwapTransactionDetailsModule';
export { default as SwitchModule } from './SwitchModule';
export { default as TitleLabel } from './TitleLabel';
export { default as TokenBalanceModule } from './TokenBalanceModule';
export { default as TokenInputField } from './TokenInputField';
export { default as TokenOutputField } from './TokenOutputField';
export { default as TokenTypeImageModule } from './TokenTypeImageModule';
export { default as TransactionDetailsModule } from './TransactionDetailsModule';
export { default as TransactionTextModule } from './TransactionTextModule';
export { default as UnitSelectionModule } from './UnitSelectionModule';
export { default as TabImageModule } from './TabImageModule';
export { default as Line } from './Line';

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
  // width: 'auto',
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
  farmableBeanBalance: '',
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
  budgetBalance:
    'This is the number of Beans in the Marketing and Development Budgets.',
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
export const claimableStrings = {
  beans:
    'Claimable Beans is the sum of harvestable Pods, claimable Bean withdrawals, and Beans under claimable LP withdrawals. Use the Claim button to claim all Claimable Beans and Claimable ETH.',
  eth: 'Claimable ETH is the sum of ETH under claimable LP Withdrawals and from Seasons of Plenty. Use the Claim button to claim all Claimable Beans and Claimable ETH.',
  grownStalk:
    'Grown Stalk do not earn Farmable Beans. Once farmed, Grown Stalk earn Farmable Beans. Use the Farm button to farm all Farmable Beans, Stalk, Seeds, and Grown Stalk.',
  farm: 'Use this button to Farm all Farmable Beans, Stalk, Seeds, and Grown Stalk.',
};

export const fieldStrings = {
  sow: 'Use this tab to sow Beans in the Field in exchange for Pods.',
  sendPlot: 'Use this tab to send Plots to another Ethereum address.',
  harvest:
    'Use this tab to Harvest Pods. You can also toggle the "Claim" setting on in the Silo or Field modules to Harvest and use your Pods in a single transaction.',
  sendPlotWarning:
    'WARNING: There is currently no decentralized market for buying and selling Plots. Send Plots at your own risk.',
  availableSoil:
    'Soil is the number of Beans that Beanstalk is currently willing to borrow. Anyone can lend any number of Beans up to the Available Soil in exchange for Pods.',
  podLine:
    'The Pod Line is the total number of Unharvestable Pods. This is the amount of debt Beanstalk has outstanding.',
  weather:
    'The Weather is the interest rate for sowing Beans. For a given Weather w, you receive w + 1 Pods for each Bean sown.',
  podsHarvested:
    'The total Harvested Pods over all Seasons is the amount of debt Beanstalk has paid off thus far.',
  podAPY:
    'The Pod APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  seasonsToPodClearance:
    'The Seasons to Pod Clearance is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate Seasons to Pod Clearance,',
};
export const siloStrings = {
  beanDeposit:
    'Use this sub-tab to deposit Beans to the Silo. You can toggle the settings to deposit from Beans, ETH, or both.',
  beanWithdraw:
    'Use this sub-tab to withdraw Beans from the Silo. Withdrawals will be claimable 24 full Seasons after withdrawal.',
  beanClaim: 'Use this sub-tab to Claim Withrawn LP Tokens from the Silo.',
  beanDepositsTable: 'View all your current Bean Deposits in this table.',
  beanWithdrawalsTable: 'View all your current Bean Withdrawals in this table.',
  beanAPY:
    'The Bean APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  lpDeposit:
    'Use this sub-tab to deposit LP Tokens to the Silo. You can toggle the settings to deposit from Beans, ETH, or both and to convert Deposited Beans to Deposited LP Tokens.',
  lpWithdraw:
    'Use this sub-tab to withdraw LP Tokens from the Silo. Withdrawals will be claimable 24 full Seasons after withdrawal.',
  lpClaim: 'Use this sub-tab to Claim Withrawn LP Tokens from the Silo.',
  lpDepositsTable: 'View all your current LP Token Deposits in this table.',
  lpWithdrawalsTable:
    'View all your current LP Token Withdrawals in this table.',
  lpAPY:
    'The LP APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  siloDescription:
    'The Silo is the Beanstalk DAO. Silo Members earn passive interest during Bean supply increases. Anyone can become a Silo Member by depositing Beans or LP Tokens for the BEAN:ETH Uniswap pool in the Silo module below in exchange for Stalk and Seeds. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. The Seed token yields .0001 Stalk every Season. No action is ever required of Silo Members. All Stalk and Seeds associated with a Deposit are forfeited upon withdrawal. All Withdrawals are frozen for 24 full Seasons.',
  withdrawWarning:
    'WARNING: Your Withdrawal will be frozen for 24 full Seasons.',
};
export const tradeStrings = {
  swap: 'Use this tab to trade against the BEAN:ETH Uniswap pool directly on the bean.money website.',
  send: 'Use this tab to send Beans to another Ethereum address.',
  price: 'This is the live Bean price on Uniswap.',
  tradeDescription:
    'Anyone can buy and sell Beans on Uniswap directly through the bean.money website. To buy and deposit or buy and sow in a single transaction from ETH, use the Silo and Field modules, respectively.',
};
export const governanceStrings = {
  bips: 'Below is a complete list of all historical BIPs.',
  activeBips:
    'Active Beanstalk Improvement Proposals currently being voted on.',
  governanceDescription:
    'Beanstalk is upgraded in a decentralized fashion through Beanstalk Improvement Proposals (BIPs). Anyone with more than .1% of the total outstanding Stalk can propose a BIP. Any Stalk holder can vote for a BIP. BIPs can be committed in as little as 24 Seasons with a 2/3 supermajority, or after 168 Seasons with a 1/2 majority.',
};
