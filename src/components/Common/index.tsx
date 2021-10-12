import { withStyles, Theme } from'@material-ui/styles'
import Tooltip from '@material-ui/core/Tooltip'

export { Grid } from '@material-ui/core'
export type { Token } from '../../util'
export {
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TransitAsset,
  UniswapAsset
} from '../../util'

export { default as AddressInputField } from './AddressInputField'
export { default as BalanceField} from './BalanceField'
export { default as BaseModule } from './BaseModule'
export { default as ContentSection } from './ContentSection'
export { default as DataBalanceModule } from'./DataBalanceModule'
export { default as EthInputField} from './EthInputField'
export { default as FrontrunText } from './FrontrunText'
export { default as HeaderLabel } from './HeaderLabel'
export { default as HeaderLabelWithTimer } from './HeaderLabelWithTimer'
export { default as InputFieldPlus} from './InputFieldPlus'
export { default as ListTable } from './ListTable'
export { default as NftListTable } from './NftListTable'
export { default as NftPicTable } from './NftPicTable'
export { default as QuestionModule } from './QuestionModule'
export { default as SettingsFormModule } from './SettingsFormModule'
export { default as SingleButton } from './SingleButton'
export { default as SlippageModule } from './SlippageModule'
export { default as SwitchModule} from './SwitchModule'
export { default as TitleLabel } from './TitleLabel'
export { default as TokenBalanceModule } from './TokenBalanceModule'
export { default as TokenInputField } from './TokenInputField'
export { default as TokenOutputField } from './TokenOutputField'
export { default as TokenTypeImageModule } from './TokenTypeImageModule'
export { default as TransactionDetailsModule } from './TransactionDetailsModule'
export { default as UnitSelectionModule} from './UnitSelectionModule'

export const FormatTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'black',
    boxShadow: theme.shadows[1],
    fontSize: 12,
    fontFamily: 'Futura-Pt-Book',
    width: (props) => props.width,
    maxWidth: '345px',
    margin: (props) => props.margin
  },
}))(Tooltip)

FormatTooltip.defaultProps = {
  margin: '0 0 0 20px',
  width: 'auto',
}

export const walletDescriptions = {
  beanBalance: 'Circulating Beans are in your wallet. Circulating Beans do not earn interest. You can Deposit Beans in the Silo or Sow Beans in the Field to start earning interest on your Beans.',
  lpBalance: 'Circulating LP Tokens are in your wallet. Circulating LP Tokens do not earn interest. You can Deposit LP Tokens in the Silo to start earning interest on your Beans. To remove your liquidity from the BEAN:ETH pool, go to Uniswap.',
  beanSiloBalance: 'Your Beans Deposited in the Silo. This includes Beans you have been paid as interest on your Stalk holdings.',
  lpSiloBalance: 'Your LP Tokens Deposited in the Silo.',
  beanTransitBalance: 'Your total Beans in Unclaimable Withdrawals. Withdrawals become Claimable 24 Full Seasons after Withdrawal.',
  lpTransitBalance: 'Your total LP Tokens in Unclaimable Withdrawals. Withdrawals become Claimable 24 Full Seasons after Withdrawal.',
  claimableBeanBalance: 'Your total Claimable Beans from Pod Harvests and Withdrawals.',
  claimablelpBalance: 'Your total Claimable LP Tokens from Withdrawals.',
  claimableEthBalance:  'Your total Claimable ETH from Seasons of Plenty.',
  stalkBalance: 'Your total Stalk Balance. Stalk are the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo.',
  seedBalance: 'Your total Seed Balance. Each Seed yields .0001 Stalk each Season.',
  podBalance: 'Your total Unharvestable Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line look in the Field module.',
  ethBalance: 'Your Ethereum wallet total ETH Balance',
  topLeft: 'The Bean Balance is the total USD value of your Beans and LP Tokens. This total does not include your Pods or claimable ETH.',
  topLeftTitle: 'Bean Balance',
  topRight: 'Your current ownership of Beanstalk is displayed as a percent. Ownership is determined by your proportional ownership of Stalk.',
  topRightTitle: 'Ownership',
}
export const totalDescriptions = {
  beanBalance: 'The number of Beans not in the Silo or Withdrawals.',
  lpBalance: 'The number of LP Tokens not in the Silo or Withdrawals.',
  beanSiloBalance: 'The number of Beans currently Deposited in the Silo.',
  lpSiloBalance: 'The number of LP Tokens Deposited in the Silo.',
  beanTransitBalance: 'The number of Beans in Unclaimed Withdrawals. This includes both frozen and Claimable Bean Withdrawals.',
  lpTransitBalance: 'The number of LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable LP Token Withdrawals.',
  stalkBalance: 'The total current number of Stalk. Stalk are the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Stalk is forfeited upon Withdrawal of Deposited assets from the Silo.',
  seedBalance: 'The total current number of Seeds. Each Seed yields .0001 Stalk each Season.',
  podBalance: 'The total number of Unharvestable Pods. This is the outstanding debt of Beanstalk.',
  ethBalance: 'The number of Ethereum in the BEAN:ETH liquidity pool.',
  beanReserveTotal: 'The number of Beans in the BEAN:ETH liquidity pool.',
  topLeft: 'The current USD value of all Beans.',
  topLeftTitle: 'Market Cap',
  topRight: 'The current USD value of the BEAN:ETH liquidity pool.',
  topRightTitle: 'Pool Value',
}
export const walletStrings = {
  topLeft: 'Beans',
  topRight: 'Ownership',
}
export const totalStrings = {
  topLeft: 'USD',
  topRight: 'USD',
}
