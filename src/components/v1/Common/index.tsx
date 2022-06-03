import { Theme, withStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';
import BigNumber from 'bignumber.js';

export { Grid } from '@mui/material';
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
export { default as PlotListInputField } from './PlotListInputField';
export { default as BaseModule } from './BaseModule';
export { default as ContentDropdown } from './Content/ContentDropdown';
export { default as ContentTitle } from './Content/ContentTitle';
export { default as ContentSection } from './Content/ContentSection';
export { default as ClaimTextModule } from './ClaimTextModule';
export { default as DataBalanceModule } from './DataBalanceModule';
export { default as EthInputField } from './EthInputField';
export { default as FrontrunText } from './FrontrunText';
export { default as HeaderLabel } from './HeaderLabel';
export { default as HeaderLabelList } from './HeaderLabelList';
export { default as InputFieldPlus } from './InputFieldPlus';
export { default as ListTable } from './ListTable';
export { default as PlotInputField } from './PlotInputField';
export { default as QuestionModule } from './QuestionModule';
export { default as SettingsFormModule } from './SettingsFormModule';
export { default as SingleButton } from './SingleButton';
export { default as SlippageModule } from './SlippageModule';
export { default as SwitchModule } from './SwitchModule';
export { default as TablePageSelect } from './TablePageSelect';
export { default as TokenBalanceModule } from './TokenBalanceModule';
export { default as TokenInputField } from './TokenInputField';
export { default as TokenOutputField } from './TokenOutputField';
export { default as TokenTypeImageModule } from './TokenTypeImageModule';
export { default as TransactionDetailsModule } from './TransactionDetailsModule';
export { default as TransactionTextModule } from './TransactionTextModule';
export { default as UnitSelectionModule } from './UnitSelectionModule';
export { default as TabImageModule } from './TabImageModule';
export { default as Line } from './Line';
export { default as BalanceTableCell } from './BalanceTableCell';
export { default as TransactionToast } from './TransactionToast';

export const StyledTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'black',
    boxShadow: theme.shadows[1],
    fontSize: 12,
    fontFamily: 'Futura-Pt-Book',
    width: (props) => props.width,
    maxWidth: '345px',
    margin: (props) => props.margin || '0 0 0 20px',
  },
}))(Tooltip);

export const walletStrings = {
  beanBalance:
    'Circulating Beans are in your wallet. Circulating Beans do not earn interest. You can Deposit Beans in the Silo or Sow Beans in the Field to start earning interest on your Beans.',
  lpBalance:
    'Circulating BEAN:ETH LP Tokens are in your wallet. Circulating BEAN:ETH LP Tokens do not earn interest. You can Deposit BEAN:ETH LP Tokens in the Silo to start earning interest on your Beans. To remove your liquidity from the BEAN:ETH pool, go to Uniswap.',
  curveBalance:
    'Circulating BEAN:3CRV LP Tokens are in your wallet. Circulating BEAN:3CRV LP Tokens do not earn interest. You can Deposit BEAN:3CRV LP Tokens in the Silo to start earning interest on your Beans. To remove your liquidity from the BEAN:3CRV pool, go to Curve.',
  beanlusdBalance:
    'Circulating BEAN:LUSD LP Tokens are in your wallet. Circulating BEAN:LUSD LP Tokens do not earn interest. To remove your liquidity from the BEAN:LUSD pool, go to Curve.',
  beanSiloBalance:
    'These are your Beans which are Deposited in the Silo. This includes Beans you have been paid as interest on your Stalk holdings. For more information on your Deposited Beans, look in the Silo module.',
  lpSiloBalance:
    'These are your BEAN:ETH LP Tokens which are Deposited in the Silo. For more information on your Deposited BEAN:ETH LP Tokens, look in the Silo module.',
  curveSiloBalance:
    'These are your BEAN:3CRV LP Tokens which are Deposited in the Silo. For more information on your Deposited BEAN:3CRV LP Tokens, look in the Silo module.',
  beanlusdSiloBalance:
    'These are your BEAN:LUSD LP Tokens which are Deposited in the Silo. Currently, BEAN:LUSD LP Tokens are not whitelisted for the Silo and cannot be deposited.',
  beanTransitBalance:
    'These are your Beans in Unclaimed Withdrawals. This includes both frozen and Claimable Bean Withdrawals.',
  lpTransitBalance:
    'These are your BEAN:ETH LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:ETH LP Token Withdrawals.',
  curveTransitBalance:
    'These are your BEAN:3CRV LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:3CRV LP Token Withdrawals.',
  beanlusdTransitBalance:
    'These are your BEAN:LUSD LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:LUSD LP Token Withdrawals.',
  claimableBeanBalance:
    'These are your total Claimable Beans which are from Pod Harvests and Withdrawals. For more information on your Claimable Bean Withdrawals, look in the Silo module. For more information on your Harvestable Pods, look in the Field module.',
  claimablelpBalance:
    'These are your total Claimable BEAN:ETH LP Tokens which are from Withdrawals. For more information on your Claimable BEAN:ETH LP Token Withdrawals, look in the Silo module.',
  claimableCurveBalance:
    'These are your total Claimable BEAN:3CRV LP Tokens which are from Withdrawals. For more information on your Claimable BEAN:3CRV LP Token Withdrawals, look in the Silo module.',
  claimableBeanlusdBalance:
    'These are your total Claimable BEAN:LUSD LP Tokens which are from Withdrawals. For more information on your Claimable BEAN:LUSD LP Token Withdrawals, look in the Silo module.',
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
    'The Balance is the total USD value of your Beans, BEAN:ETH LP Tokens, BEAN:3CRV LP Tokens and BEAN:LUSD LP Tokens. This total does not include your Pods or claimable ETH.',
  topLeftTitle: 'Balance',
  topRight:
    'Your current ownership of Beanstalk is displayed as a percent. Ownership is determined by your proportional ownership of Stalk.',
  topRightTitle: 'Ownership',
};
export const totalStrings = {
  beanBalance: 'This is the number of Beans not in the Silo or Withdrawals.',
  budgetBalance:
    'This is the number of Beans in the Marketing and Development Budgets.',
  lpBalance: 'This is the number of BEAN:ETH LP Tokens not in the Silo or Withdrawals.',
  curveBalance: 'This is the number of BEAN:3CRV LP Tokens not in the Silo or Withdrawals.',
  beanlusdBalance: 'This is the number of BEAN:LUSD LP Tokens not in the Silo or Withdrawals. Currently, BEAN:LUSD LP Tokens are not whitelisted for the Silo and cannot be deposited.',
  beanSiloBalance:
    'This is the number of Beans currently Deposited in the Silo.',
  lpSiloBalance: 'This is the number of BEAN:ETH LP Tokens Deposited in the Silo.',
  curveSiloBalance: 'This is the number of BEAN:3CRV LP Tokens Deposited in the Silo.',
  beanlusdSiloBalance: 'This is the number of BEAN:LUSD LP Tokens Deposited in the Silo. Currently, BEAN:LUSD LP Tokens are not whitelisted for the Silo and cannot be deposited.',
  beanTransitBalance:
    'This is the number of Beans in Unclaimed Withdrawals. This includes both frozen and Claimable Bean Withdrawals.',
  lpTransitBalance:
    'This is the number of BEAN:ETH LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:ETH LP Token Withdrawals.',
  curveTransitBalance:
    'This is the number of BEAN:3CRV LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:3CRV LP Token Withdrawals.',
  beanlusdTransitBalance:
    'This is the number of BEAN:LUSD LP Tokens in Unclaimed Withdrawals. This includes both frozen and Claimable BEAN:LUSD LP Token Withdrawals.',
  stalkBalance:
    'This is the total current number of Stalk. Stalk are the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Stalk is forfeited upon Withdrawal of Deposited assets from the Silo.',
  seedBalance:
    'This is the total current number of Seeds. Each Seed yields .0001 Stalk each Season.',
  podBalance:
    'This is the total number of Unharvestable Pods. This is the outstanding debt of Beanstalk.',
  ethBalance: 'This is the number of Ethereum in the BEAN:ETH liquidity pool.',
  beanReserveTotal:
    'This is the number of Beans in the BEAN:ETH, the BEAN:3CRV and the BEAN:LUSD liquidity pools.',
  topLeft: 'This is the current USD value of all Beans.',
  topLeftTitle: 'Market Cap',
  topRight: 'This is the current USD value of the BEAN:ETH, the BEAN:3CRV and the BEAN:LUSD liquidity pools.',
  topRightTitle: 'Pool Value',
};
export const walletTopStrings = {
  topLeft: 'Beans',
  topRight: 'Ownership',
};
export const totalTopStrings = {
  topLeft: 'USD',
  topRight: 'USD',
};

export const claimableStrings = {
  beans:
    'Claimable Beans is the sum of harvestable Pods, claimable Bean withdrawals, and Beans under claimable LP withdrawals. Use the Claim button to claim all Claimable Beans and Claimable ETH.',
  eth: 'Claimable ETH is the sum of ETH under claimable LP Withdrawals and from Seasons of Plenty. Use the Claim button to claim all Claimable Beans and Claimable ETH.',
  //
  farmableBeans: 'Beans earned as interest for participation in the Silo.',
  farmableStalk: 'Stalk earned in conjunction with Farmable Beans.',
  farmableSeeds: 'Seeds earned in conjunction with Farmable Beans.',
  grownStalk: 'Grown Stalk earned from your Seeds. Once farmed, Grown Stalk begin earning Farmable Beans. Use the Farm button to farm all Farmable Beans, Stalk, Seeds, and Grown Stalk.',
  farm: 'Farm all Farmable Beans, Stalk, Seeds, and Grown Stalk.',
};
export const siloStrings = {
  tokenDepositDescription: (tokenName: string) => `Use this tab to deposit ${tokenName} into the Silo.`,
  tokenWithdrawDescription: (tokenName: string, numSeasons: BigNumber) => `Use this tab to withdraw ${tokenName} from the Silo. Withdrawals will be claimable ${numSeasons} full Seasons after withdrawal.`,
  beanClaim: 'Use this sub-tab to Claim Withrawn BEAN:ETH LP Tokens from the Silo.',
  beanDepositsTable: 'View all your current Bean Deposits in this table.',
  beanWithdrawalsTable: 'View all your current Bean Withdrawals in this table.',
  beanAPY:
    'The Bean APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 720 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  convert: 'Use this tab to convert Deposited Beans to Deposited BEAN:ETH LP Tokens when P > $1 and convert Deposited BEAN:ETH LP Tokens to Deposited Beans when P < $1.',
  lpClaim: 'Use this sub-tab to Claim Withrawn BEAN:ETH LP Tokens from the Silo.',
  lpDepositsTable: 'View all your current LP Token Deposits in this table.',
  lpWithdrawalsTable:
    'View all your current LP Token Withdrawals in this table.',
  lpAPY:
    'The LP APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 720 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  curveDescription: 'Use this tab to deposit, withdraw, and claim BEAN:3CRV LP Tokens to and from the Silo.',
  curveClaim: 'Use this sub-tab to Claim Withrawn BEAN:3CRV LP Tokens from the Silo.',
  curveDepositsTable: 'View all your current BEAN:3CRV LP Token Deposits in this table.',
  curveWithdrawalsTable:
    'View all your current BEAN:3CRV LP Token Withdrawals in this table.',
  siloDescription:
    'The Silo is the Beanstalk DAO. Silo Members earn passive interest during Bean supply increases. Anyone can become a Silo Member by depositing Beans or LP Tokens for the BEAN:ETH Uniswap pool in the Silo module below in exchange for Stalk and Seeds. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. The Seed token yields .0001 Stalk every Season. No action is ever required of Silo Members. All Stalk and Seeds associated with a Deposit are forfeited upon withdrawal. All Withdrawals are frozen for {0} full Seasons.',
  withdrawWarning:
    'WARNING: Your Withdrawal will be frozen for {0} full Seasons.',
  convertWarning:
    'WARNING: When Converting all the way to the peg, the Convert may fail due to a small amount of slippage in the direction of the peg.',
  convertLPDeposit: 'Use this sub-tab to convert Deposited BEAN:ETH LP Tokens to Deposited Beans when P < $1.',
  convertBeanDeposit: 'Use this sub-tab to convert Deposited Beans to Deposited BEAN:ETH LP Tokens when P > $1.',
  convertSlippage: 'Customize the maximum difference between the current distance from peg and the distance from peg when your transaction is mined, in the direction of the peg.',
  withdrawSeasons: 'The Withdraw Seasons is the number of full Seasons assets are Frozen upon Withdrawal from the Silo.',
  decreaseSeasons: 'The Next Decrease is the number of Seasons until the Withdrawal Freeze decreases by 1 Season.',
  tvlDescription: 'The total value of all Silo deposits, denominated in USD.',
  thirtyDayInterestDescription: 'The total number of Beans paid out to Silo Members over the last 30 days.',
  myDepositsDescription: 'The total value of your Silo deposits, denominated in USD.',
  farmableBeansDescription: 'Your claimable interest for being a Silo Member.',
  myOwnershipDescription: 'Your percentage ownership of the Silo. You will receive this percentage of all new Beans minted to Silo Members.',
  farmableStalkDescription: 'Your claimable Stalk earned by holding assets in the Silo. Claiming your Stalk increases your stake in the Silo.',
  variableAPY: 'The Variable APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 720 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  stalkDescription: 'The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs.',
  seedDescription: 'The Seed token yields .0001 Stalk every Season.',
  rewardsColumn: 'Silo deposits earn Stalk and Seeds per Bean-denominated deposit value. Rewards vary between different assets. This column shows the reward for each respective asset.',
  depositsColumn: 'The amount of each token you have deposited in the Silo.',

  // OLD: Only use is in Silo/SiloActions/Modules/Old. Can be removed when these are deleted
  beanDeposit:
    'Use this sub-tab to deposit Beans to the Silo. You can toggle the settings to deposit from Beans, ETH, or both.',
  beanWithdraw:
    'Use this sub-tab to withdraw Beans from the Silo. Withdrawals will be claimable {0} full Seasons after withdrawal.',
  curveDeposit:
    'Use this sub-tab to deposit BEAN:3CRV LP Tokens to the Silo.',
  curveWithdraw:
    'Use this sub-tab to withdraw BEAN:3CRV LP Tokens from the Silo. Withdrawals will be claimable {0} full Seasons after withdrawal.',
  beanlusdDeposit:
    'Use this sub-tab to deposit BEAN:LUSD LP Tokens to the Silo.',
  beanlusdWithdraw:
    'Use this sub-tab to withdraw BEAN:LUSD LP Tokens from the Silo. Withdrawals will be claimable {0} full Seasons after withdrawal.',
  lpDeposit:
    'Use this sub-tab to deposit BEAN:ETH LP Tokens to the Silo. You can toggle the settings to deposit from Beans, ETH, or both and to convert Deposited Beans to Deposited BEAN:ETH LP Tokens.',
  lpWithdraw:
    'Use this sub-tab to withdraw BEAN:ETH LP Tokens from the Silo. Withdrawals will be claimable {0} full Seasons after withdrawal.',
};
export const fieldStrings = {
  sow: 'Use this tab to sow Beans in the Field in exchange for Pods.',
  sendPlot: 'Use this tab to send Plots to another Ethereum address.',
  harvest:
    'Use this tab to Harvest Pods. You can also toggle the "Claim" setting on in the Silo or Field modules to Harvest and use your Pods in a single transaction.',
  sendPlotWarning:
    'WARNING: You can exchange your Pods in a decentralized fashion on the Farmers Market. Send Plots at your own risk.',
  availableSoil:
    'Soil is the number of Beans that Beanstalk is currently willing to borrow. Anyone can lend any number of Beans up to the Available Soil in exchange for Pods.',
  podLine:
    'The Pod Line is the total number of Unharvestable Pods. This is the amount of debt Beanstalk has outstanding.',
  weather:
    'The Weather is the interest rate for sowing Beans. For a given Weather w, you receive w + 1 Pods for each Bean sown.',
  podsHarvested:
    'The total Harvested Pods over all Seasons is the amount of debt Beanstalk has paid off thus far.',
  podAPY:
    'The Pod APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 720 Seasons normalized to the current liquidity. For the complete formulas used to calculate APY,',
  seasonsToPodClearance:
    'The Seasons to Pod Clearance is a rough estimate based on a liquidity weighted average of Beans minted over the previous 720 Seasons normalized to the current liquidity. For the complete formulas used to calculate Seasons to Pod Clearance,',
  plotTable:
    'A Plot of Pods is created everytime Beans are Sown. Plots have a place in the Pod Line based on the order they were created. As Pods are harvested, your Plots will automatically advance in line. Entire Plots and sections of Plots can be transferred using the Send tab of the Field module.',
  activeFundraiser: 'When there is an active Fundraiser, users can sow Beans in the Field directly from USDC independent of the amount of available Soil remaining. You can participate here: ',
};
export const tradeStrings = {
  swap: 'Use this tab to trade against the BEAN:ETH Uniswap pool directly through the Beanstalk interface.',
  send: 'Use this tab to send Beans to another Ethereum address.',
  sendWarning: 'WARNING: You are sending Beans to another wallet and will no longer own them.',
  beanPrice: 'This is the live Bean price on Uniswap.',
  curvePrice: 'This is the live Bean price on Curve.',
  tradeDescription:
    'Anyone can buy and sell Beans on Uniswap directly through the Beanstalk interface, and via the Uniswap and Curve websites. To buy and deposit Beans or BEAN:ETH Uniswap V2 LP Tokens, or buy and sow in a single transaction from ETH, use the Silo and Field pages, respectively. To acquire BEAN:3CRV Curve LP Tokens, use the Curve website. To deposit BEAN:3CRV Curve LP Tokens, use the Silo page.',
  timeSinceCross: 'This is the time elapsed since the Uniswap price last crossed the peg.',
};
export const seasonStrings = {
  advance: 'Advance the Season by calling the Sunrise function',
  reward: 'Beans Rewarded for Calling the Sunrise Function Right Now',
  season: 'Seasons are the timekeeping mechanism of Beanstalk. Every Season is approximately 1 hour. Each Season begins when the Sunrise function is called on the Ethereum blockchain. The Sunrise function can be called by anyone at the top of each hour.',
  sunriseOverdue: 'This is the time elapsed since the Sunrise function could be called.',
  nextSunrise: 'This is the time until the next Sunrise function can be called at the top of the hour.',
};
export const pegStrings = {
  newBeans: 'This is the number of new Beans expected to be minted at the beginning of next Season based on the current TWAP.',
  newSoil: 'This is the number of new Soil expected to be minted at the beginning of next Season based on the current TWAP.',
  weather: 'The Weather Forecast predicts the expected Weather next Season based on the current TWAP, Pod Rate, and Delta Demand.',
  rainForecast: 'The Rain Forecast predicts whether it is expected to Rain next Season or not. It is expected to Rain if TWAP > 1 and Pod Rate < 5%.',
  price: 'This is the time weighted average Bean price during the course of the current Season.',
  podRate: 'This is the total Unharvestable Pods as a percent of total Bean supply. The Pod Rate is the Beanstalk debt level relative to the current Bean supply.',
  deltaDemand: 'Delta Demand is the rate of change in demand for Pods over the past two Seasons. Delta Demand is computed as Beans sown this Season / Beans sown last Season.',
  rain: 'This is the number of consecutive Seasons it has been Raining for.',
  pegDescription: 'Every Season, Beanstalk adjusts the Bean supply, Soil supply and Weather based on the Price, Pod Rate, and Demand for Soil. If the Price is above $1 and the Pod Rate is less than 5%, it starts to Rain.',
  pegTableDescription: 'Below are the primary datapoints of the state of Beanstalk.',
};
export const governanceStrings = {
  bips: 'Below is a complete list of all BIPs.',
  activeBips:
    'Active Beanstalk Improvement Proposals currently being voted on.',
  governanceDescription:
    'Beanstalk is upgraded in a decentralized fashion through Beanstalk Improvement Proposals (BIPs). Any Stalk holder can vote for a BIP. Anyone with more than .1% of the total outstanding Stalk can propose a BIP. BIPs can be committed in as little as 24 Seasons with a 2/3 supermajority, or after 168 Seasons with a 1/2 majority.',
};
export const curveStrings = {
  description: 'What is curve?',
  deposit: 'Use this tab to deposit assets into the BEAN:3CRV pool. Users can deposit assets in a balanced proportion or any combination of assets in the BEAN:3CRV pool.',
  withdraw: 'Use this tab to withdraw assets from the BEAN:3CRV pool. Users can withdraw assets in a balanced proportion or any combination of assets from the BEAN:3CRV pool.',
  claim: 'Use this sub-tab to Claim Withrawn BEAN:3CRV LP Tokens from the Silo.',
  holder: 'placeholder',
};
export const beanlusdStrings = {
  description: 'What is curve?',
  deposit: 'Use this tab to deposit assets into the BEAN:LUSD pool. Users can deposit assets in a balanced proportion or any combination of assets in the BEAN:LUSD pool.',
  withdraw: 'Use this tab to withdraw assets from the BEAN:LUSD pool. Users can withdraw assets in a balanced proportion or any combination of assets from the BEAN:LUSD pool.',
  claim: 'Use this sub-tab to Claim Withrawn BEAN:LUSD LP Tokens from the Silo.',
  holder: 'placeholder',
};
export const beanftStrings = {
  beanftDescription:
    'BeaNFT Genesis Collection is a series of 2067 Bean NFTs which could only be minted by participating in Beanstalk during Seasons 1200 – 1800. The top 10 Sows each Season were awarded a BeaNFT. Check out the full collection on',
  mintAll: 'Use this button to Mint all your Mintable BeaNFTs.',
  default: 'This tab will display your BeaNFTs if you have any BeaNFTs associated with this event. If it is empty, you can purchase a BeaNFT on OpenSea.',
  minted: 'Use this tab to view all the BeaNFTs you own but have already minted.',
  singleMint: 'Use this button to Mint only the individual BeaNFT currently being displayed.',
  unminted: 'Use this tab to view all the BeaNFTs you own but have not yet minted. You can mint Unminted BeaNFTs at any time. There is no penalty for waiting to mint.',
  winter: 'Use this tab to view all the Winter BeaNFTs you own. Winter BeaNFTs are not available for minting yet, but will be soon. However, the NFT image and metadata are already stored on the IPFS.',
  genesisNFTs: 'The total minted and unminted Genesis BeaNFTs that you own.',
  winterNFTs: 'The total minted and unminted Winter BeaNFTs that you own.',
};
export const beanftWinterStrings = {
  beanftDescription:
    'The BeaNFT Winter Collection is the second minting event for BeaNFTs. From Season 3300 to 3900, up to 2,000 BeaNFTs can be earned by participating in Beanstalk. The top 5 largest bean-denominated investments each Season (across the Silo and Field) will be awarded one of the 2,000 Winter BeaNFTs, until there are none left.',
  topTxn: 'This tab displays the top 5 Deposits or Sows during the current Season by Bean-denominated value.',
  topAcct: 'This tab displays all previously earned Winter Collection BeaNFTs, both minted and unminted.',
  earnedNFTs: 'The number of Winter BeaNFTs you have earned during the Winter BeaNFT event.',
  investedBeans: 'The Bean-denominated total value you have Sown or Deposited during the Winter BeaNFT event.',
  remainingNFTs: 'The number of remaining unearned Winter BeaNFTs in the Winter BeaNFT event.',
};
export const chartStrings = {
  bean: 'Use this tab to view charts with information about the BEAN token.',
  field: 'Use this tab to view charts with information about the Field.',
  silo: 'Use this tab to view charts with information about the Silo.',
};
export const beanChartStrings = {
  price: 'This is the current price at the end of every hour/day.',
  volume: 'This is the USD volume in the BEAN:ETH pool at the end of every hour/day.',
  liquidity: 'This is the USD value of the BEAN:ETH pool at the end of every hour/day.',
  marketcap: 'This is the USD value of the total Bean supply at the end of every hour/day.',
  supply: 'This is the total Bean supply at the end of every hour/day.',
  crosses: 'This is the total number of times that the price of Bean has crossed its peg at the end of every hour/day.',
};
export const fieldChartStrings = {
  rror: 'This is the current total Real Rate of Return by Season. Real Rate of Return is defined as RRoR = (1 + W) / TWAP.',
  weather: 'This is the current Weather by Season.',
  pods: 'This is the current Unharvestable Pods by Season.',
  sown: 'This is the current total Sown Beans by Season.',
  soil: 'This is the current Soil by Season.',
  podRate: 'This is the current Unharvestable Pods per Bean as a percent by Season.',
  harvested: 'This is the current total Harvested Pods by Season.',
  sowers: 'This is the current total unique Sowers by Season.',
};
export const siloChartStrings = {
  depositedBeans: 'This is the current total Deposited Beans by Season.',
  withdrawnBeans: 'This is the current total Withdrawn Beans by Season.',
  depositedLP: 'This is the current total Deposited BEAN:ETH LP Tokens by Season.',
  withdrawnLP: 'This is the current total Withdrawn BEAN:ETH LP Tokens by Season.',
  stalk: 'This is the current total Stalk by Season.',
  seeds: 'This is the current total Seeds by Season.',
};
export const claimStrings = {
  harvestable: 'Harvestable Pods can be redeemed for 1 Bean each, at any time.',
  farmable: 'Farmable Beans automatically receive Stalk. Farmable Beans receive Seeds and are deposited in a specific Season the next time you interact with the Silo.',
};
export const fundraiserStrings = {
  fundsDescription: 'Fundraisers allow Beanstalk to raise a pre-defined amount of another stablecoin in order to pay for things like audits. Each fundraiser allows anyone to exchange the desired stablecoin, up to the amount specified in the Fundraiser, for Beans at a price of $1.00. All Beans will be Sown and the corresponding amount of Pods will be sent to the wallet that contributed to the Fundraiser. Any excess funds beyond the Fundraiser amount, or of a different currency, will not receive Sown Beans.',
  fundsTableDescription: 'Below is a complete list of all Fundraisers.',
};
export const marketStrings = {
  description: 'The Farmers Market is a Beanstalk-native decentralized marketplace where anyone can buy and sell Pods in a trustless and decentralized fashion.', // TODO
  // Tabs
  sellPods: 'Use this tab to Sell Pods on the Farmers Market.',
  buyPods: 'Use this tab to Buy Pods on the Farmers Market.',
  // Sub-tabs
  sell: 'Use this sub-tab to sell Pods into outstanding Pod Orders on the Farmers Market.',
  buy: 'Use this sub-tab to buy Pods from outstanding Pod Listings on the Farmers Market.',
  createListing: 'Use this sub-tab to create a Pod Listing to sell Pods on the Farmers Marker.',
  createOrder: 'Use this sub-tab to create a Pod Order to buy Pods on the Farmers Marker.',
  // General
  pricePerPod: 'The price per Pod, denominated in Beans.',
  // Create listing
  plotRange: 'Select the range of Pods within the selected Plot to sell.',
  alreadyListed: 'Pods in this Plot are already listed on the Farmers Market. Listing Pods from the same Plot will replace the previous Pod Listing.',
  expiresIn: 'After this number of additional Pods become Harvestable, this Pod Listing will automatically Expire.',
  toWrapped: 'The Beans received from the sale of your Pods will become Claimable Beans.', // TODO: switch to "Wrapped" language - "If your Pod Listing is filled,"
  toWallet: 'The Beans received from the sale of your Pods will be sent to your wallet and become circulating Beans.',
  // Create order
  beansToLock: 'Use these Beans in your Pod Order. The Beans will be locked in the Farmers Market for facilitate instant settlement. You can receive your locked Beans at any time by cancelling the Pod Order. ',
  ethToLock: 'Buy Beans with this amount of ETH and use them to place the Pod Order. Beans will be locked them in the Market for fulfillment.',
  placeInPodLine: 'Set the maximum place in the Pod Line you are willing to buy Pods from. Any Pod before this place in the Pod Line will be eligible.', // TODO
  canCancelOrder: 'You can Cancel the Pod Order to receive the locked Beans from the Farmers Market at any time.',
  buyRangeWarning: 'WARNING: The Buy Range is too small to make an Order or there aren&apos;t enough availble Pods in the Farmers Market.',
  podsReceived: 'The number of Pods to purchase at the Price per Pod.',
  // My Market
  myOrders: 'This tab contains all of your outstanding Pod Orders on the Farmers Market.', // TODO
  myListings: 'This tab contains all of your outstanding Pod Listings on the Farmers Market.', // TODO
  myMarket: 'My Market contains all of your outstanding Pod Orders and Listings on the Farmers Market.', // TODO
  // History
  history: 'History contains a historical log of fills executed on the marketplace.'
};
export const filterStrings = {
  pricePerPod: 'Use this slider to filter Pod Orders and Pod Listings by Price per Pod.', // TODO
  placeInLine: 'Use this slider to filter Pod Orders and Pod Listings by Place in Line.', // TODO
  toggleValidOrders: 'Toggle to filter out Pod Listings that you cannot currently Fill.', // TODO
};
export const settingsStrings = {
  showLP: 'Toggle to also Deposit Circulating LP Tokens.',
  hasClaimable: 'Toggle to Claim and use Claimable assets in the transaction.',
  disableConvertible: 'Toggle to convert Deposited Beans into Deposited LP Tokens.',
  hasRemoveLP: 'Toggle to remove the Beans and ETH from the liquidity pool. By default this is toggled on.',
  toWalletDescription: 'Toggle to select whether the Beans received when your Pod Listing is Filled should be sent to your wallet as circulating Beans, or held within Beanstalk as Claimable Beans. Toggle "To Wallet" on to have the Beans sent to your wallet.',
  toWalletCancelOrder: 'Toggle to select whether the Beans you locked up for this Pod Order should be sent to your wallet as circulating Beans, or held within Beanstalk as Claimable Beans. Toggle "To Wallet" on to have the Beans sent to your wallet.',
};