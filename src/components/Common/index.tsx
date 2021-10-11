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
  beanBalance: 'Beans not in the Silo or Unclaimable Withdrawals',
  lpBalance: 'LP Tokens not in the Silo or Unclaimable Withdrawals',
  beanSiloBalance: 'Beans Deposited in the Silo',
  lpSiloBalance: 'LP Tokens Deposited in the Silo',
  beanTransitBalance: 'Beans in Unclaimable Withdrawals',
  lpTransitBalance: 'LP Tokens in Unclaimable Withdrawals',
  claimableBeanBalance: 'Claimable Beans from Pod Harvests and Withdrawals',
  claimablelpBalance: 'Claimable LP Tokens from Withdrawals',
  claimableEthBalance:  'Claimable ETH from Seasons of Plenty',
  stalkBalance: 'Stalk Balance',
  seedBalance: 'Seed Balance',
  podBalance: 'Unharvestable Pod Balance',
  ethBalance: 'Ethereum Wallet ETH Balance',
  topLeft: 'Total USD Value of Beans and LP',
  topLeftTitle: 'Bean Balance',
  topRight: 'Percent Ownership of Beanstalk',
  topRightTitle: 'Ownership',
}
export const totalDescriptions = {
  beanBalance: 'Total Beans not in the Silo or Withdrawals',
  lpBalance: 'Total LP Tokens not in the Silo or Withdrawals',
  beanSiloBalance: 'Total Beans Deposited in the Silo',
  lpSiloBalance: 'Total LP Tokens Deposited in the Silo',
  beanTransitBalance: 'Total Beans in Unclaimed Withdrawals',
  lpTransitBalance: 'Total LP Tokens in Unclaimed Withdrawals',
  stalkBalance: 'Total Stalk',
  seedBalance: 'Total Seeds',
  podBalance: 'Total Unharvestable Pods',
  ethBalance: 'Ethereum in Liquidity Pool',
  beanReserveTotal: 'Beans in the Liquidity Pool',
  topLeft: 'USD Value of all Beans',
  topLeftTitle: 'Market Cap',
  topRight: 'USD Value of the Liquidity Pool',
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
